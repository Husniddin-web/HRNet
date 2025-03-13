-- AlterTable
ALTER TABLE "HR" ADD COLUMN     "is_associate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TgUser" ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'USER';
