-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "is_active" TIMESTAMP(3),
ADD COLUMN     "is_busy" BOOLEAN DEFAULT false;
