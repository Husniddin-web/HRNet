/*
  Warnings:

  - You are about to drop the column `is_active` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "is_active",
ADD COLUMN     "last_active" TIMESTAMP(3),
ADD COLUMN     "request_count" INTEGER DEFAULT 0;
