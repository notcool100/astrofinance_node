#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuration
const EXCEL_FILE_PATH = path.join(__dirname, '..', 'Ashad 2082.xlsx');
const DEFAULT_INTEREST_RATE = 4.0;
const DEFAULT_OPENING_DATE = new Date('2024-01-01');

// Sample data from the Excel file (first 10 rows)
const sampleSBData = [
  {
    name: 'BALDEV RAUT',
    accountNumber: '068-SB001',
    jesthaBalance: 9198,
    ashadBalance: 9706.8455,
    interest: 508.8455
  },
  {
    name: 'DEEPAK KSHETRI',
    accountNumber: '068-SB002',
    jesthaBalance: 647,
    ashadBalance: 32993.57408,
    interest: 346.574083
  },
  {
    name: 'RITESH POUDYAL',
    accountNumber: '068-SB003',
    jesthaBalance: 26979,
    ashadBalance: 28242.74775,
    interest: 1263.74775
  },
  {
    name: 'SUNIL ADHIKARI',
    accountNumber: '068-SB004',
    jesthaBalance: -7120,
    ashadBalance: -1672.626667,
    interest: 4135.373333
  },
  {
    name: 'NIRAJ DAHAL',
    accountNumber: '068-SB005',
    jesthaBalance: 1311,
    ashadBalance: 2099.15475,
    interest: 788.15475
  },
  {
    name: 'DEEPAK KC',
    accountNumber: '068-SB007',
    jesthaBalance: 2509,
    ashadBalance: 2622.226917,
    interest: 113.226917
  },
  {
    name: 'CHIRANJIBI LUHAGUN',
    accountNumber: '068-SB008',
    jesthaBalance: 6706,
    ashadBalance: 10588.8385,
    interest: 382.8385
  },
  {
    name: 'ACHUT NEPAL',
    accountNumber: '068-SB009',
    jesthaBalance: 17518,
    ashadBalance: 18341.43217,
    interest: 823.432167
  },
  {
    name: 'PRABIN RAI',
    accountNumber: '068-SB011',
    jesthaBalance: 420,
    ashadBalance: 442.325,
    interest: 22.325
  }
];

function cleanString(str) {
  if (!str || str === 'NaN' || str === null || str === undefined) {
    return null;
  }
  return String(str).trim();
}

function cleanNumber(num) {
  if (!num || num === 'NaN' || num === null || num === undefined) {
    return 0;
  }
  const parsed = parseFloat(num);
  return isNaN(parsed) ? 0 : parsed;
}

function generateUserIdNumber(accountNumber) {
  const numbers = accountNumber.replace(/[^0-9]/g, '');
  return numbers || '000000';
}

async function uploadSBAccounts() {
  try {
    console.log('🚀 Starting SB accounts upload process...');
    console.log(`📊 Processing ${sampleSBData.length} sample accounts`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < sampleSBData.length; i++) {
      try {
        const data = sampleSBData[i];
        
        console.log(`\n👤 Processing: ${data.name} (${data.accountNumber})`);
        
        // Generate user data
        const userIdNumber = generateUserIdNumber(data.accountNumber);
        const userData = {
          fullName: data.name,
          dateOfBirth: new Date('1990-01-01'),
          gender: null,
          contactNumber: `+977${userIdNumber}`,
          email: null,
          address: 'Kathmandu, Nepal',
          idType: 'CITIZENSHIP',
          idNumber: userIdNumber,
          userType: 'SB',
          isActive: true
        };
        
        // Check if user already exists
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { idNumber: userData.idNumber },
              { contactNumber: userData.contactNumber }
            ]
          }
        });
        
        // Create user if doesn't exist
        if (!user) {
          console.log(`  ➕ Creating user: ${userData.fullName}`);
          user = await prisma.user.create({
            data: userData
          });
          console.log(`  ✅ User created with ID: ${user.id}`);
        } else {
          console.log(`  ℹ️  User already exists: ${user.id}`);
        }
        
        // Generate account data
        const accountData = {
          accountNumber: data.accountNumber,
          userId: user.id,
          balance: data.ashadBalance || data.jesthaBalance || 0,
          interestRate: DEFAULT_INTEREST_RATE,
          openingDate: DEFAULT_OPENING_DATE,
          lastTransactionDate: new Date(),
          status: 'ACTIVE',
          accountType: 'SB'
        };
        
        // Check if account already exists
        let account = await prisma.userAccount.findFirst({
          where: {
            accountNumber: accountData.accountNumber
          }
        });
        
        // Create account if doesn't exist
        if (!account) {
          console.log(`  ➕ Creating account: ${accountData.accountNumber}`);
          account = await prisma.userAccount.create({
            data: accountData
          });
          console.log(`  ✅ Account created with ID: ${account.id}`);
          successCount++;
        } else {
          console.log(`  ℹ️  Account already exists: ${account.id}`);
          // Update balance if account exists
          if (accountData.balance !== account.balance) {
            await prisma.userAccount.update({
              where: { id: account.id },
              data: { balance: accountData.balance }
            });
            console.log(`  🔄 Updated account balance to: ${accountData.balance}`);
          }
        }
        
      } catch (rowError) {
        console.error(`❌ Error processing row ${i + 1}:`, rowError.message);
        errors.push({
          row: i + 1,
          error: rowError.message,
          data: sampleSBData[i]
        });
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successfully processed: ${successCount} accounts`);
    console.log(`❌ Errors: ${errorCount} accounts`);
    
    if (errors.length > 0) {
      console.log('\n❌ Error Details:');
      errors.forEach(error => {
        console.log(`  Row ${error.row}: ${error.error} (${error.data.name} - ${error.data.accountNumber})`);
      });
    }
    
    // Verify the upload
    const totalUsers = await prisma.user.count({
      where: { userType: 'SB' }
    });
    
    const totalAccounts = await prisma.userAccount.count({
      where: { accountType: 'SB' }
    });
    
    console.log('\n🔍 Verification:');
    console.log(`📊 Total SB Users in database: ${totalUsers}`);
    console.log(`📊 Total SB Accounts in database: ${totalAccounts}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the upload process
if (require.main === module) {
  uploadSBAccounts()
    .then(() => {
      console.log('\n🎉 SB accounts upload completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Upload failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadSBAccounts };
