import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const setting = await prisma.settings.findUnique({
        where: { key: "herocard" },
      });
      return res.status(200).json(setting || {});
    }

    if (req.method === "POST") {
      const data = req.body;
      const value = JSON.stringify(data);

      const setting = await prisma.settings.upsert({
        where: { key: "herocard" },
        update: { value },
        create: { key: "herocard", value },
      });

      return res.status(200).json(setting);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
