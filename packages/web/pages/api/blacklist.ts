import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const blacklistedAssets = await prisma.asset.findMany({
    where: { isBlackList: true },
    select: { coinMinimalDenom: true },
  });

  res.status(200).json(blacklistedAssets.map((a) => a.coinMinimalDenom));
}
