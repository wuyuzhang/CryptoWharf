// server/index.js

const PORT = process.env.SERVER_PORT;
const express = require('express');
const app = express();
app.use(express.json());

const functions = require('firebase-functions');

const cors = require('cors');
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));


app.post('/api/fake', (req, res) => {
  console.log(req.body);
  res.json({ message: 'Call received!' });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Expose Express API as a single Cloud Function:
exports.backend_apis = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onRequest(app);
