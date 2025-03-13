-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" SERIAL NOT NULL,
    "hr_id" INTEGER NOT NULL,
    "employe_id" INTEGER NOT NULL,
    "token" TEXT,
    "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_hr_id_fkey" FOREIGN KEY ("hr_id") REFERENCES "HR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
