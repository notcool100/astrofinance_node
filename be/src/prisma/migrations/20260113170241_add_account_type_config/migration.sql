-- CreateTable
CREATE TABLE "account_type_configs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_type_configs_code_key" ON "account_type_configs"("code");

-- CreateIndex
CREATE INDEX "account_type_configs_code_idx" ON "account_type_configs"("code");

-- CreateIndex
CREATE INDEX "account_type_configs_isActive_idx" ON "account_type_configs"("isActive");
