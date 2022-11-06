// server/livepeer.js


async function getUploadVideoUrl(req, res) {
    if (!req.body.filename) {
      res.status(400).send('Filename needed');
      return
    }
    const response = await fetch(
      "https://livepeer.studio/api/asset/request-upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LIVEPEER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: req.body.filename,
        }),
      }
    );
  
    return response.json()
  }
  
  module.exports = { getUploadVideoUrl }