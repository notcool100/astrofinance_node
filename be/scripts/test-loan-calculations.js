const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Define InterestType enum locally
const InterestType = {
  FLAT: 'FLAT',
  DIMINISHING: 'DIMINISHING'
};

// EMI calculation functions
function calculateEMI(principal, interestRate, tenure, interestType) {
  if (interestType === InterestType.FLAT) {
    // Flat interest calculation
    const monthlyInterest = (principal * interestRate) / 1200; // Monthly interest amount
    const emi = (principal / tenure) + monthlyInterest; // Principal component + Interest component
    return parseFloat(emi.toFixed(2));
  } else {
    // Diminishing interest calculation (reducing balance)
    const monthlyRate = interestRate / 1200; // Monthly interest rate
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return parseFloat(emi.toFixed(2));
  }
}

function generateRepaymentSchedule(principal, interestRate, tenure, interestType, disbursementDate, firstPaymentDate) {
  const schedule = [];
  const emi = calculateEMI(principal, interestRate, tenure, interestType);
  let remainingPrincipal = principal;
  
  for (let i = 1; i <= tenure; i++) {
    let principalComponent, interestComponent;
    
    if (interestType === InterestType.FLAT) {
      // Flat interest calculation
      interestComponent = (principal * interestRate) / 1200;
      principalComponent = principal / tenure;
    } else {
      // Diminishing interest calculation
      interestComponent = (remainingPrincipal * interestRate) / 1200;
      principalComponent = emi - interestComponent;
    }
    
    // Round to 2 decimal places
    principalComponent = parseFloat(principalComponent.toFixed(2));
    interestComponent = parseFloat(interestComponent.toFixed(2));
    
    // Adjust last installment to account for rounding errors
    if (i === tenure) {
      principalComponent = remainingPrincipal;
    }
    
    // Calculate due date
    const dueDate = new Date(firstPaymentDate);
    dueDate.setMonth(dueDate.getMonth() + i - 1);
    
    // Update remaining principal
    remainingPrincipal -= principalComponent;
    remainingPrincipal = parseFloat(remainingPrincipal.toFixed(2));
    
    // Ensure remaining principal doesn't go below zero
    if (remainingPrincipal < 0) remainingPrincipal = 0;
    
    schedule.push({
      installmentNumber: i,
      dueDate,
      principalAmount: principalComponent,
      interestAmount: interestComponent,
      totalAmount: parseFloat((principalComponent + interestComponent).toFixed(2)),
      remainingPrincipal
    });
  }
  
  return schedule;
}

function compareInterestMethods(principal, interestRate, tenure) {
  // Calculate for flat rate
  const flatEmi = calculateEMI(principal, interestRate, tenure, InterestType.FLAT);
  const flatTotalInterest = (principal * interestRate * tenure) / 1200;
  const flatTotalAmount = principal + flatTotalInterest;
  
  // Calculate for diminishing balance
  const diminishingEmi = calculateEMI(principal, interestRate, tenure, InterestType.DIMINISHING);
  const diminishingTotalInterest = diminishingEmi * tenure - principal;
  const diminishingTotalAmount = principal + diminishingTotalInterest;
  
  // Calculate differences
  const emiDifference = Math.abs(flatEmi - diminishingEmi);
  const interestDifference = Math.abs(flatTotalInterest - diminishingTotalInterest);
  const totalDifference = Math.abs(flatTotalAmount - diminishingTotalAmount);
  
  // Determine which method is better
  const isFlatBetter = flatTotalInterest < diminishingTotalInterest;
  const recommendation = isFlatBetter
    ? 'The Flat Rate method results in lower total interest payments for this specific scenario.'
    : 'The Reducing Balance method is generally more favorable as it results in lower total interest payments.';
  
  return {
    flat: {
      emi: parseFloat(flatEmi.toFixed(2)),
      totalInterest: parseFloat(flatTotalInterest.toFixed(2)),
      totalAmount: parseFloat(flatTotalAmount.toFixed(2))
    },
    diminishing: {
      emi: parseFloat(diminishingEmi.toFixed(2)),
      totalInterest: parseFloat(diminishingTotalInterest.toFixed(2)),
      totalAmount: parseFloat(diminishingTotalAmount.toFixed(2))
    },
    difference: {
      emi: parseFloat(emiDifference.toFixed(2)),
      totalInterest: parseFloat(interestDifference.toFixed(2)),
      totalAmount: parseFloat(totalDifference.toFixed(2))
    },
    recommendation
  };
}

async function testLoanCalculations() {
  try {
    console.log('🧮 Testing Loan Calculations...\n');

    // Get existing loan types
    const loanTypes = await prisma.loanType.findMany({
      where: { isActive: true }
    });

    if (loanTypes.length === 0) {
      console.log('❌ No loan types found. Please create some loan types first.');
      return;
    }

    console.log('📋 Available Loan Types:');
    loanTypes.forEach(lt => {
      console.log(`  - ${lt.name} (${lt.code}): ${lt.interestRate}% p.a. - ${lt.interestType}`);
    });

    // Test parameters
    const testAmount = 100000; // ₹1,00,000
    const testTenure = 12; // 12 months
    const testInterestRate = 12.0; // 12% per annum

    console.log(`\n🧪 Test Parameters:`);
    console.log(`  Amount: ₹${testAmount.toLocaleString()}`);
    console.log(`  Tenure: ${testTenure} months`);
    console.log(`  Interest Rate: ${testInterestRate}% p.a.`);

    // Test Flat Interest Calculation
    console.log(`\n📊 FLAT INTEREST CALCULATION:`);
    const flatEMI = calculateEMI(testAmount, testInterestRate, testTenure, InterestType.FLAT);
    const flatTotalInterest = (testAmount * testInterestRate * testTenure) / 1200;
    const flatTotalAmount = testAmount + flatTotalInterest;

    console.log(`  Monthly EMI: ₹${flatEMI.toFixed(2)}`);
    console.log(`  Total Interest: ₹${flatTotalInterest.toFixed(2)}`);
    console.log(`  Total Amount: ₹${flatTotalAmount.toFixed(2)}`);

    // Test Diminishing Interest Calculation
    console.log(`\n📊 DIMINISHING INTEREST CALCULATION:`);
    const diminishingEMI = calculateEMI(testAmount, testInterestRate, testTenure, InterestType.DIMINISHING);
    const diminishingTotalInterest = diminishingEMI * testTenure - testAmount;
    const diminishingTotalAmount = testAmount + diminishingTotalInterest;

    console.log(`  Monthly EMI: ₹${diminishingEMI.toFixed(2)}`);
    console.log(`  Total Interest: ₹${diminishingTotalInterest.toFixed(2)}`);
    console.log(`  Total Amount: ₹${diminishingTotalAmount.toFixed(2)}`);

    // Compare both methods
    console.log(`\n📈 COMPARISON:`);
    const comparison = compareInterestMethods(testAmount, testInterestRate, testTenure);
    
    console.log(`  EMI Difference: ₹${comparison.difference.emi.toFixed(2)}`);
    console.log(`  Interest Difference: ₹${comparison.difference.totalInterest.toFixed(2)}`);
    console.log(`  Total Amount Difference: ₹${comparison.difference.totalAmount.toFixed(2)}`);
    console.log(`  Recommendation: ${comparison.recommendation}`);

    // Generate repayment schedules
    console.log(`\n📅 REPAYMENT SCHEDULE (First 3 installments):`);
    
    const disbursementDate = new Date();
    const firstPaymentDate = new Date();
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);

    // Flat Interest Schedule
    console.log(`\n  FLAT INTEREST SCHEDULE:`);
    const flatSchedule = generateRepaymentSchedule(
      testAmount, 
      testInterestRate, 
      testTenure, 
      InterestType.FLAT, 
      disbursementDate, 
      firstPaymentDate
    );
    
    flatSchedule.slice(0, 3).forEach(installment => {
      console.log(`    Installment ${installment.installmentNumber}:`);
      console.log(`      Due Date: ${installment.dueDate.toLocaleDateString()}`);
      console.log(`      Principal: ₹${installment.principalAmount.toFixed(2)}`);
      console.log(`      Interest: ₹${installment.interestAmount.toFixed(2)}`);
      console.log(`      Total: ₹${installment.totalAmount.toFixed(2)}`);
      console.log(`      Balance: ₹${installment.remainingPrincipal.toFixed(2)}`);
    });

    // Diminishing Interest Schedule
    console.log(`\n  DIMINISHING INTEREST SCHEDULE:`);
    const diminishingSchedule = generateRepaymentSchedule(
      testAmount, 
      testInterestRate, 
      testTenure, 
      InterestType.DIMINISHING, 
      disbursementDate, 
      firstPaymentDate
    );
    
    diminishingSchedule.slice(0, 3).forEach(installment => {
      console.log(`    Installment ${installment.installmentNumber}:`);
      console.log(`      Due Date: ${installment.dueDate.toLocaleDateString()}`);
      console.log(`      Principal: ₹${installment.principalAmount.toFixed(2)}`);
      console.log(`      Interest: ₹${installment.interestAmount.toFixed(2)}`);
      console.log(`      Total: ₹${installment.totalAmount.toFixed(2)}`);
      console.log(`      Balance: ₹${installment.remainingPrincipal.toFixed(2)}`);
    });

    console.log(`\n✅ Loan calculation tests completed successfully!`);

  } catch (error) {
    console.error('❌ Error testing loan calculations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testLoanCalculations();
