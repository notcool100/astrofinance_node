#!/usr/bin/env python3
import pandas as pd
import sys
import os

def read_excel_file(file_path):
    """Read and display contents of an Excel file"""
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"Error: File '{file_path}' not found.")
            return
        
        # Read the Excel file
        # Try to read all sheets
        excel_file = pd.ExcelFile(file_path)
        
        print(f"Excel file: {file_path}")
        print(f"Number of sheets: {len(excel_file.sheet_names)}")
        print(f"Sheet names: {excel_file.sheet_names}")
        print("=" * 50)
        
        # Read each sheet
        for sheet_name in excel_file.sheet_names:
            print(f"\nSheet: '{sheet_name}'")
            print("-" * 30)
            
            # Read the sheet
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Display basic info about the sheet
            print(f"Shape: {df.shape} (rows, columns)")
            print(f"Columns: {list(df.columns)}")
            
            # Display first few rows
            if not df.empty:
                print("\nFirst 10 rows:")
                print(df.head(10).to_string())
                
                # Display data types
                print(f"\nData types:")
                print(df.dtypes)
            else:
                print("Sheet is empty")
            
            print("\n" + "=" * 50)
            
    except Exception as e:
        print(f"Error reading Excel file: {e}")

if __name__ == "__main__":
    file_path = "Ashad 2082.xlsx"
    read_excel_file(file_path)
