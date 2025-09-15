import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const adId = parseInt(id as string, 10);

  try {
    if (req.method === "PUT") {
      const { title, description, link, imageUrl } = req.body;
      const ad = await prisma.ads.update({
        where: { id: adId },
        data: { title, description, link, imageUrl },
      });
      return res.status(200).json(ad);
    }

    if (req.method === "DELETE") {
      await prisma.ads.delete({ where: { id: adId } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
