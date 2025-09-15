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
        prisma.notification.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.notification.count(),
      ]);

      return res.status(200).json({ items, total, page, pageSize });
    }

    if (req.method === "POST") {
      const { title, description, type } = req.body;
      const notification = await prisma.notification.create({
        data: { title, description, type },
      });
      return res.status(201).json(notification);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
