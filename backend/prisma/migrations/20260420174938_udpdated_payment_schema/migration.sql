/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[razorpay_payment_id]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `razorpay_payment_id` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payment_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "razorpay_payment_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payment_razorpay_payment_id_key" ON "payment"("razorpay_payment_id");
