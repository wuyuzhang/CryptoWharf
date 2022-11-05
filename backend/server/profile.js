const { setData } = require('./firebase')
const { authenticate } = require('./auth')

/**
 * Create user profile
 * @param {req} req
 * @param {res} res
 */
async function createProfile (req, res) {
  // authenticate
  const userData = await authenticate(req, res)
  if (!userData) {
    return
  }

  // set profile object
  const email = req.body.email
  await setData('user_profiles/' + userData.user_uuid, { email })

  return {
    user_uuid: req.body.user_uuid,
    email: req.body.email,
    telegram: req.body.telegram
  }
}

module.exports = { createProfile }
