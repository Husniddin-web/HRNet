-- CreateTable
CREATE TABLE "supportReqeust" (
    "id" SERIAL NOT NULL,
    "role" "ROLE",
    "email" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "admin_id" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "supportReqeust_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "supportReqeust" ADD CONSTRAINT "supportReqeust_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
