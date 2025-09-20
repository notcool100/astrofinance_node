#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuration
const EXCEL_FILE_PATH = path.join(__dirname, '..', 'Ashad 2082.xlsx');
const DEFAULT_INTEREST_RATE = 5.0; // Higher interest rate for BB accounts
const DEFAULT_OPENING_DATE = new Date('2024-01-01');

// We'll use the Python script to read Excel and output JSON
const PYTHON_SCRIPT = `
import pandas as pd
import json
import sys

def clean_string(value):
    if pd.isna(value) or value is None or str(value).strip() == 'NaN':
        return None
    return str(value).strip()

def clean_number(value):
    if pd.isna(value) or value is None or str(value).strip() == 'NaN':
        return 0
    try:
        return float(value)
    except:
        return 0

# Read the BB sheet
df = pd.read_excel('${EXCEL_FILE_PATH}', sheet_name='BB')

# Process the data
processed_data = []
for index, row in df.iterrows():
    # The BB sheet has account number in NAME column and name in Account Number column
    account_number = clean_string(row.get('NAME'))
    name = clean_string(row.get('Account Number'))
    jestha_balance = clean_number(row.get('Jestha Balance'))
    ashad_balance = clean_number(row.get('Ashad Balance'))
    interest = clean_number(row.get('Intrest 2081/2082'))
    
    # Skip if essential data is missing or header row
    if not name or not account_number or account_number == 'NAME':
        continue
    
    processed_data.append({
        'name': name,
        'accountNumber': account_number,
        'jesthaBalance': jestha_balance,
        'ashadBalance': ashad_balance,
        'interest': interest
    })

# Output as JSON
print(json.dumps(processed_data, indent=2))
`;

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

async function readExcelData() {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    
    // Write Python script to temporary file
    const tempScriptPath = path.join(__dirname, 'temp_bb_reader_fixed.py');
    fs.writeFileSync(tempScriptPath, PYTHON_SCRIPT);
    
    const python = spawn('python3', [tempScriptPath]);
    let data = '';
    let error = '';
    
    python.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    python.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });
    
    python.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (code !== 0) {
        reject(new Error(`Python script failed: ${error}`));
        return;
      }
      
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (e) {
        reject(new Error(`Failed to parse JSON: ${e.message}`));
      }
    });
  });
}

async function uploadBBAccounts() {
  try {
    console.log('🚀 Starting BB (Bises Bachat) accounts upload process...');
    
    // Check if Excel file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found at: ${EXCEL_FILE_PATH}`);
    }
    
    console.log('📊 Reading Excel file...');
    const bbData = await readExcelData();
    
    console.log(`📋 Found ${bbData.length} valid rows in BB sheet`);
    
    // Show first few entries for verification
    console.log('\n📝 Sample data:');
    bbData.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} - ${item.accountNumber} - Balance: ${item.ashadBalance}`);
    });
    
    // Process each row
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < bbData.length; i++) {
      try {
        const data = bbData[i];
        
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
          userType: 'BB', // Business Bank user type
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
          accountType: 'BB' // Business Bank account type
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
          
          // Create BB account details (guardian information)
          const bbAccountDetails = {
            accountId: account.id,
            guardianName: `${data.name} (Self)`, // Default to self as guardian
            guardianRelation: 'Self',
            guardianContact: userData.contactNumber,
            guardianIdType: 'CITIZENSHIP',
            guardianIdNumber: userIdNumber,
            maturityDate: null // No maturity date for BB accounts
          };
          
          console.log(`  ➕ Creating BB account details`);
          await prisma.bbAccountDetails.create({
            data: bbAccountDetails
          });
          console.log(`  ✅ BB account details created`);
          
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
          data: bbData[i]
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
      where: { userType: 'BB' }
    });
    
    const totalAccounts = await prisma.userAccount.count({
      where: { accountType: 'BB' }
    });
    
    const totalBBDetails = await prisma.bbAccountDetails.count();
    
    console.log('\n🔍 Verification:');
    console.log(`📊 Total BB Users in database: ${totalUsers}`);
    console.log(`📊 Total BB Accounts in database: ${totalAccounts}`);
    console.log(`📊 Total BB Account Details in database: ${totalBBDetails}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the upload process
if (require.main === module) {
  uploadBBAccounts()
    .then(() => {
      console.log('\n🎉 BB (Bises Bachat) accounts upload completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Upload failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadBBAccounts };
