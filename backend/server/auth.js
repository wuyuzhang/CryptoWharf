// server/auth.js

const { getData, setData } = require('./firebase');
const uuid = require('uuid4');

/**
 * Get signature nonce
 * @param {number} req
 * @param {number} res 
 * @return {number} nonce
 */
async function getSignatureNonce(req, res) {
  const walletAddress = req.body.wallet_address;
  const nonceContext = req.body.nonce_context;
  if (!walletAddress || !nonceContext) {
    res.status(400).send('Not valid');
    return;
  }

  if (nonceContext != 'sign_in') {
    res.status(404).send('Not found');
    return;
  }
  const nonceInfo = await getData('wallets/' +
    walletAddress + '/nonces/' + nonceContext);
  if (nonceInfo && nonceInfo.expires_at > Date.now()) {
    return nonceInfo.nonce;
  } else {
    const newNonce = uuid();
    const expiresAt = Date.now() + 600000; // nonce expires in 10 minutes
    await setData('wallets/' + walletAddress + '/nonces/' + nonceContext, {
      'nonce': newNonce,
      'expires_at': expiresAt,
    });
    return newNonce;
  }
}

module.exports = { getSignatureNonce };