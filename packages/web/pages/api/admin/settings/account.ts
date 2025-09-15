import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Assuming only ONE admin user exists
      const admin = await prisma.admin.findFirst();
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      const updated = await prisma.admin.update({
        where: { id: admin.id },
        data: { email, password: hashedPassword },
      });

      return res
        .status(200)
        .json({ message: "Account updated", admin: updated });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
