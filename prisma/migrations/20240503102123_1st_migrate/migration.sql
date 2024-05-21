-- CreateTable
CREATE TABLE "Spot" (
    "id" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "EUI" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Spot_id_key" ON "Spot"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Spot_EUI_key" ON "Spot"("EUI");
