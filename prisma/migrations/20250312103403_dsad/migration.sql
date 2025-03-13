-- DropForeignKey
ALTER TABLE "HR" DROP CONSTRAINT "HR_tg_user_id_fkey";

-- AddForeignKey
ALTER TABLE "HR" ADD CONSTRAINT "HR_tg_user_id_fkey" FOREIGN KEY ("tg_user_id") REFERENCES "TgUser"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
