import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import HttpError from "../utils/http-error.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/api/banners/all", async (req, res) => {
  const banners = await prisma.banner.findMany();

  if (banners.length == 0) {
    throw new HttpError("Banners(s) not found.", 404);
  }

  res.send(banners);
});

export default router;
