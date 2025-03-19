/*
  Warnings:

  - Made the column `remainingBalance` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `remainingPlates` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "sellerId" INTEGER,
ALTER COLUMN "remainingBalance" SET NOT NULL,
ALTER COLUMN "remainingPlates" SET NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "endTime" DROP NOT NULL,
ALTER COLUMN "familyNames" DROP NOT NULL,
ALTER COLUMN "menu" DROP NOT NULL,
ALTER COLUMN "observations" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "startTime" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Seller" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_name_key" ON "Seller"("name");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
