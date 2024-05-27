import type { NextApiRequest, NextApiResponse } from "next";
import { SectorCoordinates } from "@/pages/spot";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method, body } = req;
  const rowStart = parseInt(body.rowStart as string, 10);
  const colStart = parseInt(body.colStart as string, 10);
  const rotated = body.rotated as boolean;
  const index = parseInt(body.index as string, 10);
  if (method != "GET") {
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
      const allSectorCoordinates: SectorCoordinates[] =
        await prisma.sectorCoordinates.findMany({});
      res.status(200).json(allSectorCoordinates);
      res.end();
      break;
    case "DELETE":
      const sector: SectorCoordinates = await prisma.sectorCoordinates.delete({
        where: {
          index: index,
        },
      });
      res.status(200);
      res.end();
      break;
    case "POST":
      if (query.action === "create") {
        const sector: SectorCoordinates = await prisma.sectorCoordinates.create(
          {
            data: { index: index },
          }
        );
      } else {
        const sector: SectorCoordinates = await prisma.sectorCoordinates.update(
          {
            where: {
              index: index,
            },
            data: {
              rowStart,
              colStart,
              rotated,
            },
          }
        );
      }

      res.status(200);
      res.end();
      break;
  }
}
