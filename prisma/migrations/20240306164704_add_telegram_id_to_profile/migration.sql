/*
  Warnings:

  - A unique constraint covering the columns `[telegram_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "telegram_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_telegram_id_key" ON "profiles"("telegram_id");
