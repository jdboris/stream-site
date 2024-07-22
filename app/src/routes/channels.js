import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import HttpError from "../utils/http-error.js";
import ChannelDto from "../dots/channel-dto.js";
import { getCurrentUser } from "../utils/auth.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/api/channels/all", async (req, res) => {
  const channels = await prisma.channel.findMany();

  if (channels.length == 0) {
    throw new HttpError("Channels(s) not found.", 404);
  }

  const user = await getCurrentUser(req);

  res.send(
    channels.map((x) =>
      user && (user.isStreamer || user.isAdmin) ? x : new ChannelDto(x)
    )
  );
});

router.get("/api/channels/live", async (req, res) => {
  const settings = await prisma.setting.findFirst({
    include: { liveChannel: true },
  });

  if (!settings) {
    throw new HttpError("Live channel not found.", 404);
  }

  if (!settings.liveChannel) {
    throw new HttpError("Live channel not found.", 404);
  }

  res.send(new ChannelDto(settings.liveChannel));
});

router.post("/api/channels", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError("Please login to continue.", 401);
  }

  if (!user.isStreamer && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  const {
    service,
    description,
    name,
    source,
    isSecure,

    streamUrl,
    key,
  } = req.body;

  await prisma.channel.create({
    data: {
      creatorId: user.id,
      service,
      description: description ?? null,
      name,
      source,
      isSecure: isSecure ?? true,

      streamUrl,
      key,
    },
  });

  res.send({ success: true });
});

router.put("/api/channels", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    throw new HttpError("Please login to continue.", 401);
  }

  if (!user.isStreamer && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  const {
    id,
    service,
    description,
    name,
    source,
    isSecure,

    streamUrl,
    key,
  } = req.body;

  const channel = await prisma.channel.findFirst({ where: { id } });

  if (!channel) {
    throw new HttpError("Channel not found.", 404);
  }

  if (channel.creatorId != user.id && !user.isAdmin) {
    throw new HttpError("Permission denied.", 403);
  }

  await prisma.channel.update({
    data: {
      service,
      description,
      name,
      source,
      isSecure,
      streamUrl,
      key,
    },
    where: { id },
  });

  res.send({ success: true });
});

export default router;
