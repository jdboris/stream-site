import { PrismaClient } from "@prisma/client";
import { Router } from "express";

// TODO:

const prisma = new PrismaClient();
const router = Router();

router.get("/api/users/:id/leads", async (req, res) => {
  const { id } = req.params;

  const leads = await prisma.lead.findMany({
    where: {
      userId: Number(id),
    },
  });

  res.json(leads);
});

export default router;
