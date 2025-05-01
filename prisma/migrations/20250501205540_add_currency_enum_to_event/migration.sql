-- CreateEnum
CREATE TYPE "CurrencySymbol" AS ENUM ('ARS', 'USD');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "currency" "CurrencySymbol" NOT NULL DEFAULT 'ARS';
