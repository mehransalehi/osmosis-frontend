/*
  Warnings:

  - A unique constraint covering the columns `[coinMinimalDenom]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Asset_coinMinimalDenom_key" ON "Asset"("coinMinimalDenom");
