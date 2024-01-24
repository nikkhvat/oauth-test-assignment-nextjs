import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { z } from "zod";

import prisma from "@/data/prisma/instance";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const userSchema = z.object({
  username: z.string().min(5),
  password: z.string().min(8),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    userSchema.parse({ username, password });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res.status(201).json({ message: "User created", userId: user.id });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002" && Array.isArray(error.meta?.target) && error.meta?.target.includes("username")) {
        return res.status(409).json({ error: "User with this username already exists" });
      }
    }

    if (error instanceof z.ZodError) {
      const validationErrors = error.format();
      return res.status(400).json({ error: "Validation error", validationErrors });
    }
    
    res.status(500).json({ error: "Error creating user" });
  }
}
