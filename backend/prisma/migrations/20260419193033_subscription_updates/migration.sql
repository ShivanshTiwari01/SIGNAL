/*
  Warnings:

  - The values [Free,Pro,Institutional] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stripePriceId` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[subscriptionId]` on the table `subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `razorpayId` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriptionId` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('free', 'trader', 'protrader');
ALTER TABLE "public"."user" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "user" ALTER COLUMN "plan" SET DEFAULT 'free';
COMMIT;

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- DropIndex
DROP INDEX "subscription_stripeSubscriptionId_key";

-- DropIndex
DROP INDEX "user_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "razorpayId" TEXT NOT NULL,
ADD COLUMN     "subscriptionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "stripeCustomerId",
ALTER COLUMN "plan" SET DEFAULT 'free';

-- DropTable
DROP TABLE "session";

-- CreateIndex
CREATE UNIQUE INDEX "subscription_subscriptionId_key" ON "subscription"("subscriptionId");
