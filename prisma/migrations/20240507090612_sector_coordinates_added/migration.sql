-- CreateTable
CREATE TABLE "sectorCoordinates" (
    "index" INTEGER NOT NULL,
    "rowStart" INTEGER NOT NULL,
    "colStart" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "sectorCoordinates_index_key" ON "sectorCoordinates"("index");
