-- CreateTable
CREATE TABLE "Credentials" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phone_number" TEXT,

    CONSTRAINT "Credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credentials_email_key" ON "Credentials"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Credentials_phone_number_key" ON "Credentials"("phone_number");
