import { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";

import prisma from "@/data/prisma/instance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { name, redirectUris } = req.body;

  console.log(`reg client ${name}, ${redirectUris.join("|")}`);

  const clientId = randomBytes(16).toString("hex");
  const clientSecret = randomBytes(32).toString("hex");

  try {
    const client = await prisma.client.create({
      data: {
        clientId,
        clientSecret,
        redirectUris,
      },
    });
    res.status(201).json({
      clientId: client.clientId,
      clientSecret: client.clientSecret,
    });
  } catch (error) {
    res.status(500).json({ error: "Client registration error" });
  }
}
