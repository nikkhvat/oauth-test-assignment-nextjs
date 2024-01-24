import { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";

import { z } from "zod";

import prisma from "@/data/prisma/instance";

const clientSchema = z.object({
  name: z.string().min(6).max(255),
  redirectUris: z.array(z.string()),
});

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
    clientSchema.parse({ name, redirectUris });

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
    if (error instanceof z.ZodError) {
      const validationErrors = error.format();
      return res.status(400).json({ error: "Validation error", validationErrors });
    }

    res.status(500).json({ error: "Client registration error" });
  }
}
