-- CreateTable
CREATE TABLE "loan_calculator_presets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loanTypeId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "tenure" INTEGER NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "interestType" "InterestType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_calculator_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_calculator_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loanTypeId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "tenure" INTEGER NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "interestType" "InterestType" NOT NULL,
    "emi" DECIMAL(15,2) NOT NULL,
    "totalInterest" DECIMAL(15,2) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_calculator_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loan_calculator_presets_userId_idx" ON "loan_calculator_presets"("userId");

-- CreateIndex
CREATE INDEX "loan_calculator_presets_loanTypeId_idx" ON "loan_calculator_presets"("loanTypeId");

-- CreateIndex
CREATE INDEX "loan_calculator_history_userId_idx" ON "loan_calculator_history"("userId");

-- CreateIndex
CREATE INDEX "loan_calculator_history_loanTypeId_idx" ON "loan_calculator_history"("loanTypeId");

-- CreateIndex
CREATE INDEX "loan_calculator_history_calculatedAt_idx" ON "loan_calculator_history"("calculatedAt");

-- AddForeignKey
ALTER TABLE "loan_calculator_presets" ADD CONSTRAINT "loan_calculator_presets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_calculator_presets" ADD CONSTRAINT "loan_calculator_presets_loanTypeId_fkey" FOREIGN KEY ("loanTypeId") REFERENCES "loan_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_calculator_history" ADD CONSTRAINT "loan_calculator_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_calculator_history" ADD CONSTRAINT "loan_calculator_history_loanTypeId_fkey" FOREIGN KEY ("loanTypeId") REFERENCES "loan_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
