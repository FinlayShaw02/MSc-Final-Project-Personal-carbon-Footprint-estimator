# =============================================================================
#  Script: pre_process_defra_2025.py
#
#  Description:
#  Ingests DEFRA’s “GHG conversion factors 2025 (flat format)” workbook and
#  outputs a tidy CSV containing only CO₂e factors (one “kg CO2e” factor per
#  activity). CH₄/N₂O per-gas breakdown rows are excluded for simpler joins
#  and downstream analysis.
#
#  Author: Finlay Shaw
# =============================================================================


import pandas as pd

# Step 1: Load the Excel file and skip the first 5 non-data rows
# - The DEFRA workbook has a preamble/header; real data starts after row 5.
excel_path = "ghg-conversion-factors-2025-flat-format.xlsx" 
sheet_name = "Factors by Category"
df = pd.read_excel(excel_path, sheet_name=sheet_name, skiprows=5)

# Step 2: Rename the relevant columns
# - Normalise to simpler, consistent field names for downstream processing.
df = df.rename(columns={
    "Level 1": "Category",
    "Level 2": "Subcategory",
    "Level 3": "Detail",
    "Level 4": "Activity",
    "Column Text": "Description",
    "UOM": "Unit",
    "GHG Conversion Factor 2025": "EmissionFactor"
})

# Step 3: Drop rows missing essential info (Category or EmissionFactor)
# - Keep only rows with a valid category and numeric EF.
df = df.dropna(subset=["Category", "EmissionFactor"]).reset_index(drop=True)

# Step 4: Filter to only 'kg CO2e' rows 
# - DEFRA provides multiple gases and units; we retain aggregate CO2e rows.
df = df[df["GHG/Unit"] == "kg CO2e"]

# Step 5: Select and reorder the final columns
# - Keep just the fields consumed by later scripts.
df_final = df[[
    "Category", "Subcategory", "Detail", "Activity", "Description", "Unit", "EmissionFactor"
]]

# Step 6: Export to CSV
# This CSV is used by subsequent scripts to build JS activity modules.
output_path = "pre-processed-defra.csv"
df_final.to_csv(output_path, index=False)

print(f"Processed DEFRA data saved to: {output_path}")
