#!/bin/bash

# Script to add serverSideTranslations to all pages that don't have it

PAGES_DIR="/home/notcool/Desktop/astrofinance_node/fe/src/pages"

# Function to add serverSideTranslations to a file
add_translations() {
    local file="$1"
    
    # Skip _app.tsx, _error.tsx, 404.tsx, 500.tsx as they don't need it
    if [[ "$file" == *"_app.tsx" ]] || [[ "$file" == *"_error.tsx" ]] || [[ "$file" == *"404.tsx" ]] || [[ "$file" == *"500.tsx" ]]; then
        return
    fi
    
    # Check if file already has getServerSideProps or getStaticProps
    if grep -q "getServerSideProps\|getStaticProps" "$file"; then
        echo "Skipping $file - already has server-side or static props"
        return
    fi
    
    # Check if file has export default
    if ! grep -q "export default" "$file"; then
        echo "Skipping $file - no default export found"
        return
    fi
    
    # Get the default export name
    export_name=$(grep "export default" "$file" | sed 's/export default //; s/;//')
    
    # Create the serverSideTranslations code
    translations_code="

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(m => 
        m.serverSideTranslations(locale, ['common', 'user', 'auth'])
      )),
    },
  };
}

export default $export_name;"
    
    # Remove the existing export default line and add the new code
    sed -i "/^export default $export_name;/d" "$file"
    echo "$translations_code" >> "$file"
    
    echo "Added serverSideTranslations to: $file"
}

# Find all .tsx files in pages directory
find "$PAGES_DIR" -name "*.tsx" -type f | while read -r file; do
    add_translations "$file"
done

echo "Done! All pages have been updated."
