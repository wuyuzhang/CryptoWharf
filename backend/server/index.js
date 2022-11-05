// server/index.js

const PORT = process.env.SERVER_PORT
const express = require('express')
const app = express()
app.use(express.json())

const functions = require('firebase-functions')

const { getSignatureNonce, signIn } = require('./auth')
const { createProfile } = require('./profile')
const { createProject, listProjects } = require('./project')
const { verifyWorldcoinProof, checkIfUserVerified } = require('./worldcoin');

const cors = require('cors')
// Automatically allow cross-origin requests
app.use(cors({ origin: true }))

app.post('/api/fake', (req, res) => {
  console.log(req.body)
  res.json({ message: 'Call received!' })
})

app.post('/api/get_signature_nonce', (req, res) => {
  getSignatureNonce(req, res).then((response) => {
    if (response) {
      res.json({ nonce: response })
    }
  })
})

app.post('/api/sign_in', (req, res) => {
  signIn(req, res).then((response) => {
    if (response) {
      res.json(response)
    }
  })
})

app.post('/api/create_profile', (req, res) => {
  createProfile(req, res).then((response) => {
    if (response) {
      res.json(response)
    }
  })
})

app.post('/api/create_project', (req, res) => {
  createProject(req, res).then((response) => {
    if (response) {
      res.json(response)
    }
  })
})

app.post('/api/list_projects', (req, res) => {
  listProjects(req, res).then((response) => {
    if (response) {
      res.json(response)
    }
  })
})

app.post('/api/verify_worldcoin', (req, res) => {
  verifyWorldcoinProof(req, res).then((response) => {
    if (response) {
      res.json(response);
    }
  });
});

app.post('/api/check_user_unique_human', (req, res) => {
  checkIfUserVerified(req, res).then((response) => {
    if (response) {
      res.json(response);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})

// Expose Express API as a single Cloud Function:
exports.backend_apis = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onRequest(app)
