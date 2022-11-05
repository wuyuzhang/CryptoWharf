// server/auth.js

const { getData, setData } = require('./firebase')
const uuid = require('uuid4')
const Web3 = require('web3')
const web3 = new Web3()

/**
 * Get signature nonce
 * @param {req} req
 * @param {res} res
 * @return {newNonce} nonce
 */
async function getSignatureNonce (req, res) {
  const walletAddress = req.body.wallet_address
  const nonceContext = req.body.nonce_context
  if (!walletAddress || !nonceContext) {
    res.status(400).send('Not valid')
    return
  }

  if (nonceContext !== 'sign_in') {
    res.status(404).send('Not found')
    return
  }
  const nonceInfo = await getData('wallets/' +
    walletAddress + '/nonces/' + nonceContext)
  if (nonceInfo && nonceInfo.expires_at > Date.now()) {
    return nonceInfo.nonce
  } else {
    const newNonce = uuid()
    const expiresAt = Date.now() + 600000 // nonce expires in 10 minutes
    await setData('wallets/' + walletAddress + '/nonces/' + nonceContext, {
      nonce: newNonce,
      expires_at: expiresAt
    })
    return newNonce
  }
}

/**
 * Sign in
 * @param {req} req
 * @param {res} res
 */
async function signIn (req, res) {
  const walletAddress = req.body.wallet_address
  const signature = req.body.signature
  if (!walletAddress || !signature) {
    res.status(400).send('Not valid')
    return
  }

  const nonceInfo = await getData('wallets/' +
      walletAddress + '/nonces/sign_in')
  if (!nonceInfo || nonceInfo.expires_at < Date.now()) {
    res.status(401).send('Not authorized')
    return
  }

  // Verify the signature is with information we expected
  const expectedAddress = web3.eth.accounts.recover('Sign in XXX with wallet: ' +
      walletAddress + '.\r\n\r\n(--Ignore Info Below--)\r\nNonce: ' +
      nonceInfo.nonce, signature)
  if (!expectedAddress || expectedAddress !== walletAddress) {
    res.status(401).send('Not authorized')
    return
  }

  const walletData = await getData('wallets/' + walletAddress)
  let userUuid = null
  if (!walletData.user_uuid) {
    userUuid = uuid()
    await setData('wallets/' + walletAddress, {
      user_uuid: userUuid
    })
  } else {
    userUuid = walletData.user_uuid
  }
  const authToken = uuid()
  const authTokenExpiresAt = Date.now() + 3600000
  await setData('users/' + userUuid, {
    wallet_address: walletAddress,
    auth_token: authToken,
    auth_token_expires_at: authTokenExpiresAt
  })
  await setData('wallets/' + walletAddress + '/nonces/sign_in', {
    expires_at: 0
  })
  return {
    user_uuid: userUuid,
    wallet_address: walletAddress,
    auth_token: authToken
  }
}

/**
 * Authenticate method
 * @param {req} req
 * @param {res} res
 */
async function authenticate (req, res) {
  const userUuid = req.body.user_uuid
  const authToken = req.body.auth_token
  if (!userUuid || !authToken) {
    res.status(400).send('Not valid')
    return
  }

  const userLoginInfo = await getData('users/' + userUuid)
  if (!userLoginInfo || userLoginInfo.auth_token !==
      authToken || userLoginInfo.auth_token_expires_at < Date.now()) {
    res.status(403).send('Not authenticated')
    return
  }
  return {
    user_uuid: userUuid,
    wallet_address: userLoginInfo.wallet_address,
    auth_token: authToken
  }
}

module.exports = { getSignatureNonce, signIn, authenticate }
