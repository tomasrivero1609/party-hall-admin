/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentDate` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "fileUrl",
DROP COLUMN "lastPaymentDate",
ADD COLUMN     "fileUrls" TEXT[];
