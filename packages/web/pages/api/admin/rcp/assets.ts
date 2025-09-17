import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const {
        page = "1",
        limit = "10",
        search = "",
        blacklisted = "false",
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 20);

      const where: any = {};

      if (search) {
        where.OR = [
          { assetName: { contains: search } },
          { chainName: { contains: search } },
        ];
      }

      if (blacklisted === "true") {
        where.isBlackList = true;
      }

      const total = await prisma.asset.count({ where });

      const assets = await prisma.asset.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { chainName: "asc" },
      });

      res.status(200).json({ data: assets, total });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === "PATCH") {
    const { id, isBlackList, chainNameToggle } = req.body;

    if (chainNameToggle) {
      const updated = await prisma.asset.updateMany({
        where: { chainName: chainNameToggle },
        data: { isBlackList },
      });
      res.status(200).json({ updatedCount: updated.count });
    } else {
      const updated = await prisma.asset.update({
        where: { id },
        data: { isBlackList },
      });
      res.status(200).json(updated);
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
