import type { NextApiRequest, NextApiResponse } from "next";
import { SectorCoordinates } from "@/pages/spot";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method, body } = req;
  const rowStart = parseInt(body.rowStart as string, 10);
  const colStart = parseInt(body.colStart as string, 10);
  const index = parseInt(body.index as string, 10);
  console.log(body);
  switch (method) {
    case "GET":
      // @ts-ignore
      const allSectorCoordinates: SectorCoordinates[] =
        await prisma.sectorCoordinates.findMany({});
      res.status(200).json(allSectorCoordinates);
      res.end();
      break;
    case "POST":
      await prisma.sectorCoordinates.update({
        where: {
          index: index,
        },
        data: {
          rowStart: rowStart,
          colStart: colStart,
        },
      });
      res.status(200);
      res.end();
      break;
  }
}
