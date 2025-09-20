import { InterestType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateLoanTypes() {
  console.log("Updating loan types...");

  const loanTypes = [
    {
      code: "PL",
      updates: {
        name: "Personal Loan",
        interestType: InterestType.DIMINISHING, // Changed from FLAT to DIMINISHING for better customer experience
        minAmount: 10000,
        maxAmount: 500000,
        minTenure: 3,
        maxTenure: 36,
        interestRate: 11.5, // Reduced interest rate to be more competitive
        processingFeePercent: 1.0,
        lateFeeAmount: 500,
        isActive: true,
      }
    },
    {
      code: "BL",
      updates: {
        name: "Business Loan",
        interestType: InterestType.DIMINISHING,
        minAmount: 50000,
        maxAmount: 2500000, // Increased max amount
        minTenure: 6,
        maxTenure: 60,
        interestRate: 13.5, // Slightly reduced interest rate
        processingFeePercent: 1.5,
        lateFeeAmount: 1000,
        isActive: true,
      }
    },
    {
      code: "EL",
      updates: {
        name: "Education Loan",
        interestType: InterestType.DIMINISHING,
        minAmount: 25000,
        maxAmount: 1500000, // Increased max amount for higher education costs
        minTenure: 12,
        maxTenure: 96, // Extended max tenure
        interestRate: 9.0, // Reduced interest rate for education
        processingFeePercent: 0.5,
        lateFeeAmount: 300,
        isActive: true,
      }
    },
    {
      code: "HL",
      updates: {
        name: "Home Loan",
        interestType: InterestType.DIMINISHING,
        minAmount: 500000,
        maxAmount: 15000000, // Increased max amount for real estate
        minTenure: 12,
        maxTenure: 300, // Extended to 25 years
        interestRate: 8.5, // Competitive home loan rate
        processingFeePercent: 0.75,
        lateFeeAmount: 2000,
        isActive: true,
      }
    },
  ];

  // New loan types to create if they don't exist
  const newLoanTypes = [
    {
      name: "Gold Loan",
      code: "GL",
      interestType: InterestType.FLAT,
      minAmount: 5000,
      maxAmount: 1000000,
      minTenure: 1,
      maxTenure: 24,
      interestRate: 10.0,
      processingFeePercent: 0.5,
      lateFeeAmount: 300,
      isActive: true,
    },
    {
      name: "Vehicle Loan",
      code: "VL",
      interestType: InterestType.DIMINISHING,
      minAmount: 50000,
      maxAmount: 3000000,
      minTenure: 12,
      maxTenure: 84,
      interestRate: 10.5,
      processingFeePercent: 1.0,
      lateFeeAmount: 750,
      isActive: true,
    },
    {
      name: "Micro Business Loan",
      code: "MBL",
      interestType: InterestType.DIMINISHING,
      minAmount: 10000,
      maxAmount: 200000,
      minTenure: 3,
      maxTenure: 24,
      interestRate: 15.0,
      processingFeePercent: 1.0,
      lateFeeAmount: 250,
      isActive: true,
    },
    {
      name: "Agricultural Loan",
      code: "AL",
      interestType: InterestType.DIMINISHING,
      minAmount: 20000,
      maxAmount: 1000000,
      minTenure: 6,
      maxTenure: 48,
      interestRate: 9.5,
      processingFeePercent: 0.75,
      lateFeeAmount: 500,
      isActive: true,
    },
  ];

  // Update existing loan types
  for (const loanType of loanTypes) {
    try {
      const existingLoanType = await prisma.loanType.findUnique({
        where: { code: loanType.code }
      });

      if (existingLoanType) {
        const updated = await prisma.loanType.update({
          where: { code: loanType.code },
          data: loanType.updates
        });
        console.log(`Updated loan type: ${updated.name} (${updated.code})`);
      } else {
        console.log(`Loan type with code ${loanType.code} not found. Skipping update.`);
      }
    } catch (error) {
      console.error(`Error updating loan type ${loanType.code}:`, error);
    }
  }

  // Create new loan types if they don't exist
  for (const newLoanType of newLoanTypes) {
    try {
      const existingLoanType = await prisma.loanType.findUnique({
        where: { code: newLoanType.code }
      });

      if (!existingLoanType) {
        const created = await prisma.loanType.create({
          data: newLoanType
        });
        console.log(`Created new loan type: ${created.name} (${created.code})`);
      } else {
        console.log(`Loan type with code ${newLoanType.code} already exists. Skipping creation.`);
      }
    } catch (error) {
      console.error(`Error creating loan type ${newLoanType.code}:`, error);
    }
  }

  console.log("Loan types update completed!");
}

// Run the function
updateLoanTypes()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });