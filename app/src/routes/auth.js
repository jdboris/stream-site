import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import HttpError from "../utils/http-error.js";
import { getUser, InvalidAuthToken } from "../utils/auth.js";

const prisma = new PrismaClient();
const router = Router();

router.post("/api/auth/login", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new HttpError("Missing auth token.", 400);
  }

  try {
    const user = await getUser(idToken);

    req.session.token = idToken;
    if (!user) {
      throw new HttpError("Login failed.", 400);
    }

    res.send({ message: "Login successful!" });
  } catch (error) {
    if (error instanceof InvalidAuthToken) {
      throw new HttpError("Invalid auth token. Please refresh.", 401);
    }

    throw error;
  }
});

router.get("/api/auth/logout", async (req, res) => {
  req.session.token = null;
  res.send({ message: "Logout successful!" });
});

export default router;
