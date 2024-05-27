-- AlterTable
CREATE SEQUENCE sectorcoordinates_index_seq;
ALTER TABLE "SectorCoordinates" ALTER COLUMN "index" SET DEFAULT nextval('sectorcoordinates_index_seq');
ALTER SEQUENCE sectorcoordinates_index_seq OWNED BY "SectorCoordinates"."index";
