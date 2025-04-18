export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from "formidable";
import { Buffer } from "buffer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err || !files.image) {
      return res.status(400).json({ error: "Image upload failed." });
    }

    const file = files.image[0];
    const fs = await import('fs/promises');
    const imageData = await fs.readFile(file.filepath);
    const base64 = imageData.toString("base64");
    const cleanName = file.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `images/${Date.now()}_${cleanName}`;

    const githubRes = await fetch(`https://api.github.com/repos/Patheticcs/Share-Images/contents/${filePath}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Upload ${cleanName}`,
        content: base64,
        branch: "main"
      })
    });

    const data = await githubRes.json();

    if (!githubRes.ok) {
      return res.status(500).json({ error: data.message || "GitHub upload failed" });
    }

    res.json({ url: data.content.download_url });
  });
}
