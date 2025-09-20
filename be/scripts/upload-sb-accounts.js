#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const pandas = require('pandas-js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuration
const EXCEL_FILE_PATH = path.join(__dirname, '..', 'Ashad 2082.xlsx');
const DEFAULT_INTEREST_RATE = 4.0; // Default interest rate for SB accounts
const DEFAULT_OPENING_DATE = new Date('2024-01-01'); // Default opening date

// Helper function to clean and validate data
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

function generateAccountNumber(originalAccountNumber) {
  // Clean the account number and ensure it's properly formatted
  const cleaned = cleanString(originalAccountNumber);
  if (!cleaned) {
    return null;
  }
  return cleaned;
}

function generateUserIdNumber(accountNumber) {
  // Generate a unique ID number based on account number
  // This is a simple implementation - you might want to use a more sophisticated approach
  return accountNumber.replace(/[^0-9]/g, '') || '000000';
}

async function uploadSBAccounts() {
  try {
    console.log('🚀 Starting SB accounts upload process...');
    
    // Check if Excel file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found at: ${EXCEL_FILE_PATH}`);
    }

    console.log('📊 Reading Excel file...');
    
    // Read the SB sheet from Excel
    const excelFile = pandas.ExcelFile(EXCEL_FILE_PATH);
    const sbData = pandas.readExcel(EXCEL_FILE_PATH, { sheetName: 'SB' });
    
    console.log(`📋 Found ${sbData.shape[0]} rows in SB sheet`);
    
    // Get the first few rows to understand the structure
    console.log('📝 Sample data structure:');
    console.log(sbData.head(3).toString());
    
    // Process each row
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < sbData.shape[0]; i++) {
      try {
        const row = sbData.iloc(i);
        
        // Extract data from the row
        const fullName = cleanString(row.get('Unnamed: 0'));
        const accountNumber = cleanString(row.get('Unnamed: 1'));
        const jesthaBalance = cleanNumber(row.get('Unnamed: 2'));
        const ashadBalance = cleanNumber(row.get('Unnamed: 4'));
        
        // Skip if essential data is missing
        if (!fullName || !accountNumber) {
          console.log(`⚠️  Skipping row ${i + 1}: Missing essential data (Name: ${fullName}, Account: ${accountNumber})`);
          continue;
        }
        
        // Skip if this looks like a header row
        if (fullName === 'Account Number' || accountNumber === 'Account Number') {
          console.log(`⚠️  Skipping header row ${i + 1}`);
          continue;
        }
        
        console.log(`\n👤 Processing: ${fullName} (${accountNumber})`);
        
        // Generate user data
        const userIdNumber = generateUserIdNumber(accountNumber);
        const userData = {
          fullName: fullName,
          dateOfBirth: new Date('1990-01-01'), // Default date of birth
          gender: null,
          contactNumber: `+977${userIdNumber}`, // Generate phone number
          email: null,
          address: 'Kathmandu, Nepal', // Default address
          idType: 'CITIZENSHIP',
          idNumber: userIdNumber,
          userType: 'SB', // Savings Bank user type
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
          accountNumber: generateAccountNumber(accountNumber),
          userId: user.id,
          balance: ashadBalance || jesthaBalance || 0,
          interestRate: DEFAULT_INTEREST_RATE,
          openingDate: DEFAULT_OPENING_DATE,
          lastTransactionDate: new Date(),
          status: 'ACTIVE',
          accountType: 'SB' // Savings Bank account type
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
          data: {
            fullName: cleanString(sbData.iloc(i).get('Unnamed: 0')),
            accountNumber: cleanString(sbData.iloc(i).get('Unnamed: 1'))
          }
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
        console.log(`  Row ${error.row}: ${error.error} (${error.data.fullName} - ${error.data.accountNumber})`);
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
