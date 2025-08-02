-- CreateIndex
CREATE INDEX "loan_types_interestType_idx" ON "loan_types"("interestType");

-- CreateIndex
CREATE INDEX "loan_types_isActive_idx" ON "loan_types"("isActive");

-- CreateIndex
CREATE INDEX "loan_types_interestRate_idx" ON "loan_types"("interestRate");

-- CreateIndex
CREATE INDEX "loan_types_name_idx" ON "loan_types"("name");
