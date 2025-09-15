import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { name, userEmail, text } = req.body;

      if (!name || !userEmail || !text) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const contact = await prisma.contact.create({
        data: { name, userEmail, text },
      });

      return res.status(201).json(contact);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
