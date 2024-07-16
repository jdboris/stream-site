import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import HttpError from "../utils/http-error.js";
import { getCurrentUser } from "../utils/auth.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/api/suggestions/all", async (req, res) => {
  const page = Number(req.query.page);
  const itemsPerPage = Number(req.query.itemsPerPage);

  if (!page || !itemsPerPage) {
    throw new HttpError("Suggestions not found.", 404);
  }

  if (itemsPerPage > 999) {
    throw new HttpError("Too many items per page.", 400);
  }

  const suggestions = await prisma.suggestion.findMany({
    orderBy: { suggestedAt: "desc" },
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const pageCount = (await prisma.suggestion.count()) / itemsPerPage;

  res.send({ suggestions, pageCount });
});

router.post("/api/suggestions", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError("Please login to continue.", 401);
  }

  if (user.isBanned) {
    throw new HttpError("Permission denied.", 403);
  }

  const text = req.body.text.trim();

  if (!text) {
    throw new HttpError("Please enter a suggestion.", 400);
  }

  await prisma.suggestion.create({
    data: {
      text,
      suggestedAt: new Date(),
      userId: user.id,
    },
  });

  res.send({ success: true });
});

router.delete("/api/suggestions", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError("Please login to continue.", 401);
  }

  if (!user.isStreamer && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  const { id } = req.body;

  const suggestion = await prisma.suggestion.findFirst({ where: { id } });

  if (!suggestion) {
    throw new HttpError("Suggestion not found.", 404);
  }

  await prisma.suggestion.delete({
    where: {
      id,
    },
  });

  res.send({ success: true });
});

export default router;
