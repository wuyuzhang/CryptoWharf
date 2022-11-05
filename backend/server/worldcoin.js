const { setData, getData, pushToList } = require('./firebase');
const { authenticate } = require('./auth');
const axios = require('axios');

/**
 * Check if user has a unique human proof verified
 * @param {req} req
 * @param {res} res
 */
async function checkIfUserVerified(req, res) {
  // authenticate
  const userData = await authenticate(req, res);
  if (!userData) {
    return;
  }

  const user = await getData('users/' + userData.user_uuid);
  return {
    'verified': user.has_unique_human_proof || false,
    'verified_by': user.unique_human_proof_verified_by || '',
  };
}

/**
 * Check if user has a unique human proof verified
 * @param {req} req
 * @param {res} res
 */
async function verifyWorldcoinProof(req, res) {
  // authenticate
  const userData = await authenticate(req, res);
  if (!userData) {
    return;
  }

  const user = await getData('users/' + userData.user_uuid);
  if (user.has_unique_human_proof) {
    return { 'success': true };
  }

  // TODO: Grab Worldcoin inputs from req, call Worldcoin to verify
  const response_json = await axios.post("https://developer.worldcoin.org/api/v1/verify", {
    "action_id": "wid_staging_438cadb410ecfe8e7851b4ad4e58b6d9",
    "signal": userData.wallet_address,
    "proof": req.body.proof,
    "nullifier_hash": req.body.nullifier_hash,
    "merkle_root": req.body.merkle_root,
  })
    .then(response => { return response })
    .catch((err) => {
      // Handle error
      res.status(500).send('Failed');
    });

  if (!response_json) {
    return
  }

  if (!response_json.data.success) {
    return { 'success': false };
  }

  await setData('users/' + userData.user_uuid, {
    'has_unique_human_proof': true,
    'unique_human_proof_verified_by': 'worldcoin',
  });
  await pushToList('verified_wallets', userData.wallet_address);

  return { 'success': true };
}

module.exports = { checkIfUserVerified, verifyWorldcoinProof };
