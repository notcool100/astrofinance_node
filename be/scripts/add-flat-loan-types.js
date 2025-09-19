const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addFlatLoanTypes() {
  try {
    console.log('Adding Flat Interest Loan Types...\n');

    // Check if flat loan types already exist
    const existingFlatTypes = await prisma.loanType.findMany({
      where: { interestType: 'FLAT' }
    });

    if (existingFlatTypes.length > 0) {
      console.log('Flat loan types already exist:');
      existingFlatTypes.forEach(lt => {
        console.log(`  - ${lt.name} (${lt.code}): ${lt.interestRate}% p.a.`);
      });
    }

    // Create additional Flat Interest Loan Types
    const flatLoanTypes = [
      {
        name: 'Personal Loan - Flat Rate',
        code: 'PL-FLAT',
        interestType: 'FLAT',
        minAmount: 10000,
        maxAmount: 500000,
        minTenure: 6,
        maxTenure: 60,
        interestRate: 11.5,
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
        interestRate: 13.5,
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
      },
      {
        name: 'Education Loan - Flat Rate',
        code: 'EL-FLAT',
        interestType: 'FLAT',
        minAmount: 25000,
        maxAmount: 1000000,
        minTenure: 12,
        maxTenure: 120,
        interestRate: 9.0,
        processingFeePercent: 1.5,
        lateFeeAmount: 750,
        isActive: true
      },
      {
        name: 'Vehicle Loan - Flat Rate',
        code: 'VL-FLAT',
        interestType: 'FLAT',
        minAmount: 50000,
        maxAmount: 1500000,
        minTenure: 12,
        maxTenure: 84,
        interestRate: 10.5,
        processingFeePercent: 1.5,
        lateFeeAmount: 800,
        isActive: true
      }
    ];

    // Check which ones don't exist and create them
    for (const loanTypeData of flatLoanTypes) {
      const existing = await prisma.loanType.findFirst({
        where: { code: loanTypeData.code }
      });

      if (!existing) {
        const loanType = await prisma.loanType.create({
          data: loanTypeData
        });
        console.log(`✅ Created: ${loanType.name} (${loanType.code}) - ${loanType.interestRate}% p.a.`);
      } else {
        console.log(`⏭️  Skipped: ${loanTypeData.name} (${loanTypeData.code}) - already exists`);
      }
    }

    console.log('\n📊 Final Loan Type Summary:');
    const allLoanTypes = await prisma.loanType.findMany({
      where: { isActive: true },
      orderBy: [{ interestType: 'asc' }, { name: 'asc' }]
    });

    console.log('\n🔵 FLAT INTEREST TYPES:');
    allLoanTypes
      .filter(lt => lt.interestType === 'FLAT')
      .forEach(lt => {
        console.log(`  - ${lt.name} (${lt.code}): ${lt.interestRate}% p.a.`);
      });

    console.log('\n🟢 DIMINISHING INTEREST TYPES:');
    allLoanTypes
      .filter(lt => lt.interestType === 'DIMINISHING')
      .forEach(lt => {
        console.log(`  - ${lt.name} (${lt.code}): ${lt.interestRate}% p.a.`);
      });

    console.log('\n✅ Flat loan types setup completed!');

  } catch (error) {
    console.error('❌ Error adding flat loan types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addFlatLoanTypes();
