/*
  Warnings:

  - A unique constraint covering the columns `[identifier,locationId]` on the table `Slot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Slot_identifier_locationId_key" ON "Slot"("identifier", "locationId");
