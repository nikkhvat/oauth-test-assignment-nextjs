import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

import { z } from "zod";

import prisma from "@/data/prisma/instance";

const JWT_SECRET = process.env.JWT_SECRET || '';

const tokenSchema = z.object({
  code: z.string(), 
  client_id: z.string(), 
  client_secret: z.string()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { code, client_id, client_secret } = req.body;

  try {
    tokenSchema.parse({ code, client_id, client_secret })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.format();
      return res.status(400).json({ error: "Validation error", validationErrors });
    }
  }

  const client = await prisma.client.findUnique({
    where: { clientId: client_id },
  });
  if (!client || client.clientSecret !== client_secret) {
    return res.status(401).json({ error: 'Invalid client credentials' });
  }

  const authCode = await prisma.authCode.findUnique({
    where: { code },
    include: { user: true },
  });

  if (!authCode || authCode.expiry < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired authorization code' });
  }

  const accessToken = jwt.sign(
    { userId: authCode.user.id, username: authCode.user.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ accessToken });
}
