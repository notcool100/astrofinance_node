#!/bin/bash

# Script to add useTranslation hook to all list pages and translate common patterns

PAGES_DIR="/home/notcool/Desktop/astrofinance_node/fe/src/pages"

# Array of common English -> Translation key replacements
declare -A translations=(
    ["\"Users\""]="t('pages.users')"
    ["\"Loans\""]="t('pages.loans')"
    ["\"Accounts\""]="t('pages.accounts')"
    ["\"Transactions\""]="t('pages.transactions')"
    ["\"Applications\""]="t('pages.applications')"
    ["\"Staff\""]="t('navigation.staff')"
    ["\"Dashboard\""]="t('pages.dashboard')"
    ["\"Add User\""]="t('actions.add_user')"
    ["\"Add Loan\""]="t('actions.add_loan')"
    ["\"Search\""]="t('search')"
    ["\"Edit\""]="t('edit')"
    ["\"Delete\""]="t('delete')"
    ["\"Cancel\""]="t('cancel')"
    ["\"Active\""]="t('status.active')"
    ["\"Inactive\""]="t('status.inactive')"
    ["\"Pending\""]="t('status.pending')"
    ["\"View all\""]="t('view_all')"
    ["\"Loading...\""]="t('loading')"
    ["\"No data found\""]="t('table.no_data')"
    ["\"Actions\""]="t('table.actions')"
    ["\"Status\""]="t('table.status')"
    ["\"Name\""]="t('table.name')"
    ["\"Contact\""]="t('table.contact')"
    ["\"Created\""]="t('table.created')"
    ["\"Amount\""]="t('table.amount')"
    ["\"Date\""]="t('table.date')"
    ["\"All Status\""]="t('status.all_status')"
)

# Function to add useTranslation to a file
add_use_translation() {
    local file="$1"
    
    # Skip if already has useTranslation
    if grep -q "useTranslation" "$file"; then
        echo "Skipping $file - already has useTranslation"
        return
    fi
    
    # Add import after other imports
    if grep -q "from 'react'" "$file"; then
        sed -i "/from 'react'/a import { useTranslation } from 'next-i18next';" "$file"
        
        # Add const { t } after component declaration
        sed -i "/const.*: React.FC/a \\tconst { t } = useTranslation('common');" "$file"
        
        echo "Added useTranslation to: $file"
    fi
}

# Function to replace common strings
replace_strings() {
    local file="$1"
    
    for eng in "${!translations[@]}"; do
        trans="${translations[$eng]}"
        # Use perl for better regex handling
        perl -i -pe "s/$eng/{$trans}/g" "$file" 2>/dev/null || true
    done
    
    echo "Replaced strings in: $file"
}

# Find all index.tsx list pages
find "$PAGES_DIR" -name "index.tsx" -type f | while read -r file; do
    echo "Processing: $file"
    add_use_translation "$file"
    replace_strings "$file"
done

echo "Done! All list pages have been updated with translations."
