import { NextApiRequest, NextApiResponse } from "next";

import { z } from "zod";

import prisma from "@/data/prisma/instance";

const querySchema = z.object({
  response_type: z.string(),
  client_id: z.string(),
  redirect_uri: z.string(),
  username: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }
  const { response_type, client_id, redirect_uri, username } = req.query;

  try {
    querySchema.parse({ response_type, client_id, redirect_uri, username })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.format();
      return res.status(400).json({ error: "Validation error", validationErrors });
    }
  }

  const user = await prisma.user.findUnique({ where: { username: username as string } });

  if (!user) {
    return res.status(401).json({ error: 'There is no user with this username' });
  }

  if (response_type !== 'code') {
    return res.status(400).json({ error: 'Unsupported response type' });
  }

  const client = await prisma.client.findUnique({ where: { clientId: client_id as string } });
  if (!client) {
    
    return res.status(400).json({ error: 'Incorrect client_id' });
  }

  try {
    const authCode = await prisma.authCode.create({
      data: {
        userId: user?.id,
        expiry: new Date(Date.now() + 30 * 60 * 1000),
        redirectUri: redirect_uri as string,
      },
    });

    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.append('code', authCode.code);

    res.redirect(redirectUrl.toString());
  } catch (error) {

    if (error instanceof z.ZodError) {
      const validationErrors = error.format();
      return res.status(400).json({ error: "Validation error", validationErrors });
    }

    res.status(500).json({ error: 'Error creating authorization code' });
  }
}
