-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('ACTIVE', 'RESIGNED', 'TERMINATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING');

-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('USER', 'HR', 'ADMIN', 'SUPERADMIN');

-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refresh_token" TEXT,
    "status" "Status" NOT NULL DEFAULT 'INACTIVE',
    "role" "ROLE" NOT NULL DEFAULT 'ADMIN',
    "tg_user_id" BIGINT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HR" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "refresh_token" TEXT,
    "confirm_by_id" INTEGER,
    "tg_user_id" BIGINT,

    CONSTRAINT "HR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "director_full_name" TEXT NOT NULL,
    "director_phone" TEXT NOT NULL,
    "director_email" TEXT NOT NULL,
    "company_documentation" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "confirm_by_id" INTEGER,
    "created_by_id" INTEGER,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyHR" (
    "id" SERIAL NOT NULL,
    "hr_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "hr_document" TEXT NOT NULL,

    CONSTRAINT "CompanyHR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'INACTIVE',
    "password" TEXT,
    "refresh_token" TEXT,
    "tg_user_id" BIGINT,
    "is_temproray" BOOLEAN DEFAULT true,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerHistory" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "hired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employment_type" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "left_at" TIMESTAMP(3),
    "performance_score" INTEGER,
    "working_mode" TEXT NOT NULL,
    "status" "WorkerStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "WorkerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TgUser" (
    "user_id" BIGINT NOT NULL,
    "user_name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone_number" TEXT,
    "last_state" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TgUser_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_name_key" ON "SocialMedia"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HR_email_key" ON "HR"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HR_confirm_by_id_key" ON "HR"("confirm_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_director_email_key" ON "Company"("director_email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyHR_hr_id_company_id_key" ON "CompanyHR"("hr_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TgUser_phone_number_key" ON "TgUser"("phone_number");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_tg_user_id_fkey" FOREIGN KEY ("tg_user_id") REFERENCES "TgUser"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HR" ADD CONSTRAINT "HR_confirm_by_id_fkey" FOREIGN KEY ("confirm_by_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HR" ADD CONSTRAINT "HR_tg_user_id_fkey" FOREIGN KEY ("tg_user_id") REFERENCES "TgUser"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_confirm_by_id_fkey" FOREIGN KEY ("confirm_by_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "HR"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyHR" ADD CONSTRAINT "CompanyHR_hr_id_fkey" FOREIGN KEY ("hr_id") REFERENCES "HR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyHR" ADD CONSTRAINT "CompanyHR_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_tg_user_id_fkey" FOREIGN KEY ("tg_user_id") REFERENCES "TgUser"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerHistory" ADD CONSTRAINT "WorkerHistory_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerHistory" ADD CONSTRAINT "WorkerHistory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
