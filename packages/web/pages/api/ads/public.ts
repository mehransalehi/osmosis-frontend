// pages/api/ads/public.ts
import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      // Fetch ads
      const ads = await prisma.ads.findMany({
        orderBy: { createdAt: "desc" },
      });

      // Fetch herocard
      const herocardSetting = await prisma.settings.findUnique({
        where: { key: "herocard" },
      });

      let mainApp = null;
      if (herocardSetting?.value) {
        try {
          const parsed = JSON.parse(herocardSetting.value);
          mainApp = {
            title: parsed.title || "",
            subtitle: parsed.subtitle || "",
            thumbnail_image_URL: parsed.imageUrl || "",
            hero_image_URL: parsed.imageUrl || "",
            github_URL: parsed.github || "",
            twitter_URL: parsed.twitter || "",
            external_URL: parsed.external || "",
            medium_URL: parsed.medium || "",
          };
        } catch {
          mainApp = null; // fallback
        }
      }

      return res.status(200).json({
        ads,
        mainApp,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
