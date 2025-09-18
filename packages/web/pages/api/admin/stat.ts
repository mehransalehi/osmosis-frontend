import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 1. Number of contact messages
    const contactCount = await prisma.contact.count();

    // 2. Number of ads
    const adsCount = await prisma.ads.count();

    // 3. Number of notifications
    const notificationsCount = await prisma.notification.count();

    // 4. Number of all assets
    const assetsCount = await prisma.asset.count();

    // 5. Number of chains (distinct chainName in assets)
    const chainsCount = await prisma.asset
      .groupBy({
        by: ["chainName"],
        _count: { chainName: true },
      })
      .then((data) => data.length);

    // 6. Number of blacklisted assets
    const blacklistedAssetsCount = await prisma.asset.count({
      where: { isBlackList: true },
    });

    res.status(200).json({
      contactCount,
      adsCount,
      notificationsCount,
      assetsCount,
      chainsCount,
      blacklistedAssetsCount,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
