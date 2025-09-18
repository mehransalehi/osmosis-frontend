// @ts-ignore
import formidable, { File } from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

// Disable Next.js default bodyParser for this route (needed for file upload)
export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(
    req,
    async (
      err: Error | null,
      _fields: formidable.Fields,
      files: formidable.Files
    ) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "File upload error" });
      }

      // 👇 Extract the first file correctly
      const uploadedFiles = files.file as File[] | File;
      const file = Array.isArray(uploadedFiles)
        ? uploadedFiles[0]
        : uploadedFiles;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Size check
      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({ error: "File size exceeds 4 MB limit" });
      }

      // Type check
      if (file.mimetype !== "image/png") {
        return res.status(400).json({ error: "Only PNG files are allowed" });
      }

      // Destination path (overwrite logo.png)
      const logoPath = path.join(process.cwd(), "public", "images", "logo.png");

      try {
        fs.copyFileSync(file.filepath, logoPath);
        return res
          .status(200)
          .json({ success: true, message: "Logo updated successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to save logo" });
      }
    }
  );
}
