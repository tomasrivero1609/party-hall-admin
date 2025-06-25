-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('EVENT_PAYMENT', 'RESERVATION', 'VENUE_RENTAL', 'TAXES', 'OTHER');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "description" TEXT,
ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'EVENT_PAYMENT';
