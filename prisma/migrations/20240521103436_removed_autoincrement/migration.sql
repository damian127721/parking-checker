-- AlterTable
ALTER TABLE "SectorCoordinates" ALTER COLUMN "index" DROP DEFAULT;
DROP SEQUENCE "sectorcoordinates_index_seq";
