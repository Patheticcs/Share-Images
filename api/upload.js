const fetch = require('node-fetch'); // To make HTTP requests

module.exports = async (req, res) => {
  const { image } = req.body;
  const imageName = req.query.name || 'default-image.png'; // Get image name from query or use a default name

  // Check if an image is provided
  if (!image) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }

  // Get your GitHub Personal Access Token and Repo details from environment variables
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USER = 'Patheticcs';
  const GITHUB_REPO = 'Share-Images';
  const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/images/${imageName}.png`;

  try {
    // First, check if the image with the same name already exists in the repo
    const existingFileCheck = await fetch(GITHUB_API_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    // If file exists, return an error
    if (existingFileCheck.ok) {
      return res.status(400).json({ error: 'This image name is already taken. Please choose a different name.' });
    }

    // Prepare the GitHub API request to upload the image
    const uploadResponse = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add image ${imageName}`,
        content: image.toString('base64'), // Convert the image to base64
      }),
    });

    const responseBody = await uploadResponse.json();

    if (uploadResponse.ok) {
      // Return the URL of the uploaded image on GitHub
      const imageUrl = responseBody.content.download_url;
      res.status(200).json({ url: imageUrl });
    } else {
      res.status(500).json({ error: 'Failed to upload the image to GitHub.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during the upload process.' });
  }
};
