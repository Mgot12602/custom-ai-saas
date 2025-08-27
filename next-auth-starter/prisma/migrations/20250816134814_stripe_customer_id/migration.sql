/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_pricingPlanId_fkey";

-- DropIndex
DROP INDEX "public"."User_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "stripeCustomerId" TEXT,
ALTER COLUMN "pricingPlanId" SET DEFAULT 'price_free_plan';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "stripeCustomerId";

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "public"."Subscription"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "public"."PricingPlan"("stripePriceId") ON DELETE RESTRICT ON UPDATE CASCADE;
