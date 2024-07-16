import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { getCurrentUser } from "../utils/auth.js";
import HttpError from "../utils/http-error.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/api/stream-events/all", async (req, res) => {
  const month = Number(req.query.month);
  const year = Number(req.query.year);

  if (!month || !year) {
    throw new HttpError("Stream events not found.", 404);
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const daysInMonth = new Date(year, start.getMonth() + 1, 0).getDate();
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    daysInMonth,
    23,
    59,
    59
  );

  // Get all events that start OR end between the specified range
  const streamEvents = await prisma.streamEvent.findMany({
    where: {
      OR: [
        {
          AND: {
            start: { gte: start, lte: end },
          },
        },
        {
          AND: {
            end: { gte: start, lte: end },
          },
        },
      ],
    },
    take: 999,
  });

  res.send(streamEvents);
});

router.post("/api/stream-events", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError("Please login to continue.", 401);
  }

  if (!user.isStreamer && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  const { title, start, end } = req.body;

  await prisma.streamEvent.create({
    data: {
      title,
      streamerId: user.id,
      start,
      end,
    },
  });

  res.send({ success: true });
});

router.put("/api/stream-events", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError("Please login to continue.", 401);
  }

  if (!user.isStreamer && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  const { id, title, start, end } = req.body;

  const streamEvent = await prisma.streamEvent.findFirst({ where: { id } });

  if (!streamEvent) {
    throw new HttpError("Stream event not found.", 404);
  }

  if (streamEvent.streamerId != user.id && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  await prisma.streamEvent.update({
    data: {
      title,
      start,
      end,
    },
    where: {
      id,
    },
  });

  res.send({ success: true });
});

router.delete("/api/stream-events", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError("Please login to continue.", 401);
  }

  if (!user.isStreamer && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  const { id } = req.body;

  const streamEvent = await prisma.streamEvent.findFirst({ where: { id } });

  if (!streamEvent) {
    throw new HttpError("Stream event not found.", 404);
  }

  if (streamEvent.streamerId != user.id && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  await prisma.streamEvent.delete({
    where: {
      id,
    },
  });

  res.send({ success: true });
});

export default router;
