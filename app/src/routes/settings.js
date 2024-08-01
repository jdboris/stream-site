import { PrismaClient, Prisma } from "@prisma/client";
import { Router } from "express";
import HttpError from "../utils/http-error.js";
import ChannelDto from "../dots/channel-dto.js";
import { getCurrentUser } from "../utils/auth.js";
import SettingsDto from "../dots/settings-dto.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/api/settings", async (req, res) => {
  const user = await getCurrentUser(req);
  const settings = await prisma.setting.findFirst({
    include: { banner: true },
  });

  if (!settings) {
    throw new HttpError("Settings(s) not found.", 404);
  }

  if (user && user.isAdmin) {
    res.send(settings);
    return;
  }

  res.send(new SettingsDto(settings));
});

router.put("/api/settings", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError("Please login to continue.", 401);
  }

  if (!user.isStreamer && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  const { liveChannelId, isStreamLocked, announcement, isStatic, bannerId } =
    req.body;

  if (
    isStreamLocked !== undefined ||
    announcement !== undefined ||
    isStatic !== undefined ||
    bannerId !== undefined
  ) {
    if (!user.isAdmin) {
      throw new HttpError("Permission denied.", 403);
    }
  }

  const channel = await prisma.channel.findFirst({
    where: { id: liveChannelId },
  });

  if (!channel) {
    throw new HttpError("Channel not found.", 404);
  }

  await prisma.setting.upsert({
    create: {
      liveChannelId,
      isStreamLocked: isStreamLocked ?? false,
      announcement: announcement ?? "",
      isStatic: isStatic ?? false,
      bannerId: bannerId ?? 1,
    },
    update: { liveChannelId, isStreamLocked, announcement, isStatic, bannerId },
    where: { id: 1 },
  });

  const settings = await prisma.setting.findFirst({
    include: { banner: true, liveChannel: true },
  });

  res.send(settings && new SettingsDto(settings));
});

export default router;
