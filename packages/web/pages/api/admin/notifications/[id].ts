import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const notifId = parseInt(id as string, 10);

  try {
    if (req.method === "PUT") {
      const { title, description, type } = req.body;
      const notif = await prisma.notification.update({
        where: { id: notifId },
        data: { title, description, type },
      });
      return res.status(200).json(notif);
    }

    if (req.method === "DELETE") {
      await prisma.notification.delete({ where: { id: notifId } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
