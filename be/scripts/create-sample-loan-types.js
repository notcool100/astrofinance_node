const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleLoanTypes() {
  try {
    console.log('Creating sample loan types...');

    // Check if loan types already exist
    const existingLoanTypes = await prisma.loanType.findMany();
    if (existingLoanTypes.length > 0) {
      console.log('Loan types already exist. Skipping creation.');
      return;
    }

    // Create Flat Interest Loan Types
    const flatLoanTypes = [
      {
        name: 'Personal Loan - Flat Rate',
        code: 'PL-FLAT',
        interestType: 'FLAT',
        minAmount: 10000,
        maxAmount: 500000,
        minTenure: 6,
        maxTenure: 60,
        interestRate: 12.0,
        processingFeePercent: 2.0,
        lateFeeAmount: 500,
        isActive: true
      },
      {
        name: 'Business Loan - Flat Rate',
        code: 'BL-FLAT',
        interestType: 'FLAT',
        minAmount: 50000,
        maxAmount: 2000000,
        minTenure: 12,
        maxTenure: 84,
        interestRate: 15.0,
        processingFeePercent: 2.5,
        lateFeeAmount: 1000,
        isActive: true
      },
      {
        name: 'Home Loan - Flat Rate',
        code: 'HL-FLAT',
        interestType: 'FLAT',
        minAmount: 100000,
        maxAmount: 5000000,
        minTenure: 60,
        maxTenure: 300,
        interestRate: 8.5,
        processingFeePercent: 1.0,
        lateFeeAmount: 2000,
        isActive: true
      }
    ];

    // Create Diminishing Interest Loan Types
    const diminishingLoanTypes = [
      {
        name: 'Personal Loan - Reducing Balance',
        code: 'PL-REDUCING',
        interestType: 'DIMINISHING',
        minAmount: 10000,
        maxAmount: 500000,
        minTenure: 6,
        maxTenure: 60,
        interestRate: 12.0,
        processingFeePercent: 2.0,
        lateFeeAmount: 500,
        isActive: true
      },
      {
        name: 'Business Loan - Reducing Balance',
        code: 'BL-REDUCING',
        interestType: 'DIMINISHING',
        minAmount: 50000,
        maxAmount: 2000000,
        minTenure: 12,
        maxTenure: 84,
        interestRate: 15.0,
        processingFeePercent: 2.5,
        lateFeeAmount: 1000,
        isActive: true
      },
      {
        name: 'Home Loan - Reducing Balance',
        code: 'HL-REDUCING',
        interestType: 'DIMINISHING',
        minAmount: 100000,
        maxAmount: 5000000,
        minTenure: 60,
        maxTenure: 300,
        interestRate: 8.5,
        processingFeePercent: 1.0,
        lateFeeAmount: 2000,
        isActive: true
      }
    ];

    // Create all loan types
    const allLoanTypes = [...flatLoanTypes, ...diminishingLoanTypes];
    
    for (const loanTypeData of allLoanTypes) {
      const loanType = await prisma.loanType.create({
        data: loanTypeData
      });
      console.log(`Created loan type: ${loanType.name} (${loanType.code}) - ${loanType.interestType}`);
    }

    console.log('✅ Sample loan types created successfully!');
    console.log('\n📊 Loan Type Summary:');
    console.log('Flat Interest Types:');
    flatLoanTypes.forEach(lt => {
      console.log(`  - ${lt.name} (${lt.code}): ${lt.interestRate}% p.a.`);
    });
    console.log('\nDiminishing Interest Types:');
    diminishingLoanTypes.forEach(lt => {
      console.log(`  - ${lt.name} (${lt.code}): ${lt.interestRate}% p.a.`);
    });

  } catch (error) {
    console.error('❌ Error creating sample loan types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleLoanTypes();
