#!/usr/bin/env python3

import pandas as pd
import asyncio
import os
import sys
from datetime import datetime, date
from decimal import Decimal
import uuid

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from prisma import Prisma
from prisma.models import User, UserAccount

# Configuration
EXCEL_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'Ashad 2082.xlsx')
DEFAULT_INTEREST_RATE = Decimal('4.0')  # Default interest rate for SB accounts
DEFAULT_OPENING_DATE = datetime(2024, 1, 1)  # Default opening date

def clean_string(value):
    """Clean and validate string data"""
    if pd.isna(value) or value is None or str(value).strip() == 'NaN':
        return None
    return str(value).strip()

def clean_number(value):
    """Clean and validate numeric data"""
    if pd.isna(value) or value is None or str(value).strip() == 'NaN':
        return Decimal('0')
    try:
        return Decimal(str(value))
    except:
        return Decimal('0')

def generate_account_number(original_account_number):
    """Generate a clean account number"""
    cleaned = clean_string(original_account_number)
    if not cleaned:
        return None
    return cleaned

def generate_user_id_number(account_number):
    """Generate a unique ID number based on account number"""
    if not account_number:
        return '000000'
    # Extract numbers from account number
    numbers = ''.join(filter(str.isdigit, str(account_number)))
    return numbers if numbers else '000000'

async def upload_sb_accounts():
    """Main function to upload SB accounts from Excel file"""
    prisma = Prisma()
    await prisma.connect()
    
    try:
        print('🚀 Starting SB accounts upload process...')
        
        # Check if Excel file exists
        if not os.path.exists(EXCEL_FILE_PATH):
            raise FileNotFoundError(f'Excel file not found at: {EXCEL_FILE_PATH}')
        
        print('📊 Reading Excel file...')
        
        # Read the SB sheet from Excel
        df = pd.read_excel(EXCEL_FILE_PATH, sheet_name='SB')
        
        print(f'📋 Found {len(df)} rows in SB sheet')
        
        # Get the first few rows to understand the structure
        print('📝 Sample data structure:')
        print(df.head(3).to_string())
        
        # Process each row
        success_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Extract data from the row
                full_name = clean_string(row.get('Unnamed: 0'))
                account_number = clean_string(row.get('Unnamed: 1'))
                jestha_balance = clean_number(row.get('Unnamed: 2'))
                ashad_balance = clean_number(row.get('Unnamed: 4'))
                
                # Skip if essential data is missing
                if not full_name or not account_number:
                    print(f'⚠️  Skipping row {index + 1}: Missing essential data (Name: {full_name}, Account: {account_number})')
                    continue
                
                # Skip if this looks like a header row
                if full_name == 'Account Number' or account_number == 'Account Number':
                    print(f'⚠️  Skipping header row {index + 1}')
                    continue
                
                print(f'\n👤 Processing: {full_name} ({account_number})')
                
                # Generate user data
                user_id_number = generate_user_id_number(account_number)
                user_data = {
                    'fullName': full_name,
                    'dateOfBirth': datetime(1990, 1, 1),  # Default date of birth
                    'gender': None,
                    'contactNumber': f'+977{user_id_number}',  # Generate phone number
                    'email': None,
                    'address': 'Kathmandu, Nepal',  # Default address
                    'idType': 'CITIZENSHIP',
                    'idNumber': user_id_number,
                    'userType': 'SB',  # Savings Bank user type
                    'isActive': True
                }
                
                # Check if user already exists
                existing_user = await prisma.user.find_first(
                    where={
                        'OR': [
                            {'idNumber': user_data['idNumber']},
                            {'contactNumber': user_data['contactNumber']}
                        ]
                    }
                )
                
                # Create user if doesn't exist
                if not existing_user:
                    print(f'  ➕ Creating user: {user_data["fullName"]}')
                    user = await prisma.user.create(data=user_data)
                    print(f'  ✅ User created with ID: {user.id}')
                else:
                    print(f'  ℹ️  User already exists: {existing_user.id}')
                    user = existing_user
                
                # Generate account data
                account_data = {
                    'accountNumber': generate_account_number(account_number),
                    'userId': user.id,
                    'balance': ashad_balance if ashad_balance > 0 else jestha_balance,
                    'interestRate': DEFAULT_INTEREST_RATE,
                    'openingDate': DEFAULT_OPENING_DATE,
                    'lastTransactionDate': datetime.now(),
                    'status': 'ACTIVE',
                    'accountType': 'SB'  # Savings Bank account type
                }
                
                # Check if account already exists
                existing_account = await prisma.useraccount.find_first(
                    where={'accountNumber': account_data['accountNumber']}
                )
                
                # Create account if doesn't exist
                if not existing_account:
                    print(f'  ➕ Creating account: {account_data["accountNumber"]}')
                    account = await prisma.useraccount.create(data=account_data)
                    print(f'  ✅ Account created with ID: {account.id}')
                    success_count += 1
                else:
                    print(f'  ℹ️  Account already exists: {existing_account.id}')
                    # Update balance if account exists
                    if account_data['balance'] != existing_account.balance:
                        await prisma.useraccount.update(
                            where={'id': existing_account.id},
                            data={'balance': account_data['balance']}
                        )
                        print(f'  🔄 Updated account balance to: {account_data["balance"]}')
                
            except Exception as row_error:
                print(f'❌ Error processing row {index + 1}: {str(row_error)}')
                errors.append({
                    'row': index + 1,
                    'error': str(row_error),
                    'data': {
                        'fullName': clean_string(row.get('Unnamed: 0')),
                        'accountNumber': clean_string(row.get('Unnamed: 1'))
                    }
                })
                error_count += 1
        
        # Summary
        print('\n📊 Upload Summary:')
        print(f'✅ Successfully processed: {success_count} accounts')
        print(f'❌ Errors: {error_count} accounts')
        
        if errors:
            print('\n❌ Error Details:')
            for error in errors:
                print(f'  Row {error["row"]}: {error["error"]} ({error["data"]["fullName"]} - {error["data"]["accountNumber"]})')
        
        # Verify the upload
        total_users = await prisma.user.count(where={'userType': 'SB'})
        total_accounts = await prisma.useraccount.count(where={'accountType': 'SB'})
        
        print('\n🔍 Verification:')
        print(f'📊 Total SB Users in database: {total_users}')
        print(f'📊 Total SB Accounts in database: {total_accounts}')
        
    except Exception as error:
        print(f'💥 Fatal error: {error}')
        raise error
    finally:
        await prisma.disconnect()

async def main():
    """Main entry point"""
    try:
        await upload_sb_accounts()
        print('\n🎉 SB accounts upload completed successfully!')
    except Exception as error:
        print(f'\n💥 Upload failed: {error}')
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
