/*
  Warnings:

  - You are about to drop the column `razorpayId` on the `subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "razorpayId",
ALTER COLUMN "status" SET DEFAULT 'Inactive';
