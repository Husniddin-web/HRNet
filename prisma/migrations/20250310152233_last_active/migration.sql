/*
  Warnings:

  - A unique constraint covering the columns `[tg_user_id]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Admin_tg_user_id_key" ON "Admin"("tg_user_id");
