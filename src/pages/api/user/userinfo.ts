import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

import prisma from "@/data/prisma/instance";

const JWT_SECRET = process.env.JWT_SECRET || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const authHeader = req.headers['authorization'];

  console.log(authHeader);

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('No access token');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(404).send('User is not found');
    }

    res.json({ username: user.username, id: user.id });
  } catch (error) {
    res.status(403).send('Invalid or expired token');
  }
}
