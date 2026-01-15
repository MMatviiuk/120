/*
  Warnings:

  - You are about to alter the column `quantity` on the `Schedule` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(6,2)`.

*/
-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(6,2);
