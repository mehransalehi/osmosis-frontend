import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const page = parseInt((req.query.page as string) || "1", 10);
      const pageSize = 20;

      const [items, total] = await Promise.all([
        prisma.ads.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.ads.count(),
      ]);

      return res.status(200).json({ items, total, page, pageSize });
    }

    if (req.method === "POST") {
      const { title, description, link, imageUrl } = req.body;
      const ad = await prisma.ads.create({
        data: { title, description, link, imageUrl },
      });
      return res.status(201).json(ad);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
