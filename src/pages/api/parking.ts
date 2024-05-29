// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Spot, SectorCoordinates } from "@/pages/spot";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { compare } from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method, body } = req;
  const status = parseInt(body.data as string, 10);
  const EUI = body.EUI as string;
  const id = body.id;
  if (method != "GET" && method != "DELETE") {
    const result = await compare(body.password, process.env.PASSWORD as string);
    if (!result) {
      res.status(401).json({ error: "Unauthorized" });
      res.end();
      return;
    }
  }

  switch (method) {
    case "GET":
      // @ts-ignore
      const allSpots: Spot[] = await prisma.spot.findMany({
        select: {
          id: true,
          status: true,
        },
      });
      res.status(200).json(allSpots);
      res.end();
      break;
    case "DELETE":
      const deleteId = query.id as string;
      const spot: Spot = await prisma.spot.delete({
        where: {
          id: deleteId,
        },
      });
      res.status(200);
      res.end();
      break;
    case "POST":
      if (query.action === "create") {
        const spot: Spot = await prisma.spot.create({
          data: {
            EUI: EUI,
            status: status,
            id: id,
          },
        });
      } else {
        const spot: Spot = await prisma.spot.update({
          where: {
            EUI: EUI,
          },
          data: {
            status: status,
          },
        });
      }

      res.status(200);
      res.end();
      break;
  }
}
