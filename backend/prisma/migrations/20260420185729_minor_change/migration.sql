/*
  Warnings:

  - Made the column `currentPeriodEnd` on table `subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "subscription" ALTER COLUMN "currentPeriodEnd" SET NOT NULL,
ALTER COLUMN "cancelAtPeriodEnd" DROP NOT NULL,
ALTER COLUMN "cancelAtPeriodEnd" SET DEFAULT false;
