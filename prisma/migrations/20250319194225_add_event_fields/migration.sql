/*
  Warnings:

  - Added the required column `address` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyNames` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menu` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observations` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "familyNames" TEXT NOT NULL,
ADD COLUMN     "menu" TEXT NOT NULL,
ADD COLUMN     "observations" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "remainingBalance" DROP NOT NULL,
ALTER COLUMN "remainingPlates" DROP NOT NULL;
