import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

# Script to process the uploaded Excel file and create proper health data
logger = logging.getLogger(__name__)

def process_excel_file(file_path):
    """Process the uploaded Excel file and extract health data"""
    try:
        # Try to read the Excel file
        print(f"Processing Excel file: {file_path}")
        
        # Read all sheets
        xl_file = pd.ExcelFile(file_path, engine='openpyxl')
        print(f"Available sheets: {xl_file.sheet_names}")
        
        # Process each sheet
        for sheet_name in xl_file.sheet_names:
            print(f"\nProcessing sheet: {sheet_name}")
            df = pd.read_excel(xl_file, sheet_name=sheet_name, engine='openpyxl')
            print(f"Sheet shape: {df.shape}")
            print(f"Columns: {df.columns.tolist()}")
            print(f"First few rows:")
            print(df.head())
            
            # Check for health-related data
            health_keywords = ['malaria', 'dengue', 'respiratory', 'disease', 'case', 'infection', 'patient']
            for keyword in health_keywords:
                matching_cols = [col for col in df.columns if keyword.lower() in str(col).lower()]
                if matching_cols:
                    print(f"Found health-related columns for '{keyword}': {matching_cols}")
        
        return True
        
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        return False

if __name__ == "__main__":
    # Process the uploaded health data file
    file_path = "health_data.xlsx"
    process_excel_file(file_path)