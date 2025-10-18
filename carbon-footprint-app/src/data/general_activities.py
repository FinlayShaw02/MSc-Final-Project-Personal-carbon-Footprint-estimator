# =============================================================================
#  Script: general_activities.py
#
#  Description:
#  Builds a JavaScript module of general household activity emission factors
#  using DEFRA 2025 data. Computes per-use / per-minute / per-hour CO₂e for
#  common actions (e.g., showering, kettle boils, dishwasher, lighting) and
#  writes an ES module for front-end calculators.
#
#  Author: Finlay Shaw
# =============================================================================

import pandas as pd
import json
import os

# === Load the processed DEFRA data ===
df = pd.read_csv("pre-processed-defra.csv")

# === Clean and normalise columns ===
# Trim whitespace and normalise case for lookup consistency
df.columns = [col.strip() for col in df.columns]
df["Category"] = df["Category"].astype(str).str.strip().str.lower()
df["Description"] = df["Description"].astype(str).str.strip().str.lower()
df["Detail"] = df["Detail"].astype(str).str.strip().str.lower()
df["Unit"] = df["Unit"].astype(str).str.strip().str.lower()

# === Extract key emission factors from DEFRA ===
# Electricity factor (per kWh). Use mean to be resilient to multiple rows.
electricity_factor = df[
    (df["Category"] == "uk electricity") &
    (df["Unit"].str.contains("kwh"))
]["EmissionFactor"].mean()

# Natural gas factor (per kWh). Filter by fuels + "natural gas".
gas_factor = df[
    (df["Category"].str.contains("fuels")) &
    (df["Detail"].str.contains("natural gas", na=False)) &
    (df["Unit"].str.contains("kwh"))
]["EmissionFactor"].mean()

# Water factor - can be per litre or per cubic metre depending on DEFRA table
raw_water_factor = df[
    (df["Category"].str.contains("water")) &
    (df["Unit"].str.contains("litre|cubic metre", regex=True))
]["EmissionFactor"].mean()

# Heuristic conversion: if the mean looks like per m³ (typically >10x per-litre),
# treat it as per m³ and convert to per litre.
water_factor = raw_water_factor / 1000 if raw_water_factor > 10 else raw_water_factor

# === Define household/general activities with assumptions ===
# Emission factors are composed from electricity_factor / gas_factor / water_factor
# and appliance/usage heuristics. All units are consistent with the "unit" field.
activities = [
    {
        # Assumptions:
        # - Electric shower: ~9.5 kW
        # - Electricity per minute = 0.158 kWh
        # - Water flow: ~12 L/min
        # Emissions = electricity_factor * 0.158 + water_factor * 12
        "id": "shower_hot_per_min",
        "activity": "Take a Hot Shower",
        "unit": "minutes",
        "emissionFactor": electricity_factor * 0.158 + water_factor * 12,
        "source": "Estimated using DEFRA 2025 water and electricity factors"
    },
    {
        # Assumptions:
        # - Full hot bath volume: ~160 L
        # - Heating equivalent: ~4.0 kWh electricity
        # Emissions = electricity_factor * 4.0 + water_factor * 80
        "id": "bath_hot_avg",
        "activity": "Take a Hot Bath (Full Tub)",
        "unit": "uses",
        "emissionFactor": electricity_factor * 4.0 + water_factor * 80,
        "source": "Estimated using DEFRA 2025 water and electricity factors"
    },
    {
        # Assumptions:
        # - Boil 1.5 L water = ~0.1 kWh
        # Emissions = electricity_factor * 0.1
        "id": "boil_kettle_full",
        "activity": "Boil Electric Kettle (Full 1.5L)",
        "unit": "uses",
        "emissionFactor": electricity_factor * 0.1,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Microwave: ~0.1 kWh per minute
        # Emissions = electricity_factor * 0.1
        "id": "microwave_per_min",
        "activity": "Use Microwave",
        "unit": "minutes",
        "emissionFactor": electricity_factor * 0.1,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Electric hob: ~0.16 kWh per minute
        # Emissions = electricity_factor * 0.16
        "id": "electric_hob_per_min",
        "activity": "Cook Using Electric Hob",
        "unit": "minutes",
        "emissionFactor": electricity_factor * 0.16,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Gas hob: ~0.17 kWh gas per minute
        # Emissions = gas_factor * 0.17
        "id": "gas_hob_per_min",
        "activity": "Cook Using Gas Hob",
        "unit": "minutes",
        "emissionFactor": gas_factor * 0.17,
        "source": "Estimated using DEFRA 2025 natural gas factor"
    },
    {
        # Assumptions:
        # - Dishwasher: ~1.1 kWh electricity + 10 L water per cycle
        # Emissions = electricity_factor * 1.1 + water_factor * 10
        "id": "dishwasher_use",
        "activity": "Run Dishwasher",
        "unit": "uses",
        "emissionFactor": electricity_factor * 1.1 + water_factor * 10,
        "source": "Estimated using DEFRA 2025 electricity and water factors"
    },
    {
        # Assumptions:
        # - Washing machine: ~0.8 kWh electricity + 50 L water per cycle
        # Emissions = electricity_factor * 0.8 + water_factor * 50
        "id": "washing_machine_use",
        "activity": "Run Washing Machine",
        "unit": "uses",
        "emissionFactor": electricity_factor * 0.8 + water_factor * 50,
        "source": "Estimated using DEFRA 2025 electricity and water factors"
    },
    {
        # Assumptions:
        # - Tumble dryer: ~2.2 kWh per use
        # Emissions = electricity_factor * 2.2
        "id": "tumble_dryer_use",
        "activity": "Use Tumble Dryer",
        "unit": "uses",
        "emissionFactor": electricity_factor * 2.2,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Smartphone: ~0.04 kWh per full charge
        # Emissions = electricity_factor * 0.04
        "id": "charge_phone",
        "activity": "Charge Smartphone",
        "unit": "charges",
        "emissionFactor": electricity_factor * 0.04,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - TV: ~0.01 kWh per minute (100 W device)
        # Emissions = electricity_factor * 0.01
        "id": "use_tv_per_min",
        "activity": "Watch TV",
        "unit": "minutes",
        "emissionFactor": electricity_factor * 0.01,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Laptop: ~0.003 kWh per minute (180 W)
        # Emissions = electricity_factor * 0.003
        "id": "use_laptop_per_min",
        "activity": "Use Laptop",
        "unit": "minutes",
        "emissionFactor": electricity_factor * 0.003,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Desktop PC: ~0.004 kWh per minute (240 W)
        # Emissions = electricity_factor * 0.004
        "id": "use_desktop_pc_per_min",
        "activity": "Use Desktop PC",
        "unit": "minutes",
        "emissionFactor": electricity_factor * 0.004,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Hairdryer: ~1.2 kWh for 10 minutes
        # Emissions = electricity_factor * 0.2
        "id": "hairdryer_10_min",
        "activity": "Dry Hair with Hairdryer",
        "unit": "10 minutes",
        "emissionFactor": electricity_factor * 0.2,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Running tap: ~6 L/min
        # Emissions = water_factor * 6
        "id": "brush_teeth_tap_per_min",
        "activity": "Brush Teeth with Tap Running",
        "unit": "minutes",
        "emissionFactor": water_factor * 6,
        "source": "Estimated using DEFRA 2025 water factor"
    },
    {
        # Assumptions:
        # - Electric toothbrush: ~0.003 kWh per charge
        # Emissions = electricity_factor * 0.003
        "id": "electric_toothbrush_charge",
        "activity": "Use Electric Toothbrush",
        "unit": "charges",
        "emissionFactor": electricity_factor * 0.003,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Vacuum: ~0.3 kWh per room clean
        # Emissions = electricity_factor * 0.3
        "id": "vacuum_clean_per_room",
        "activity": "Vacuum a Room",
        "unit": "uses",
        "emissionFactor": electricity_factor * 0.3,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Iron: ~2.4 kW, 1 hour = 2.4 kWh
        # Emissions = electricity_factor * 2.4
        "id": "iron_clothes_per_hour",
        "activity": "Iron Clothes",
        "unit": "hours",
        "emissionFactor": electricity_factor * 2.4,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Air conditioner/heater: ~2 kWh per hour
        # Emissions = electricity_factor * 2.0
        "id": "use_ac_heater_per_hour",
        "activity": "Use Air Conditioner or Heater",
        "unit": "hours",
        "emissionFactor": electricity_factor * 2.0,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
 {
        # Assumptions:
        # - Fridge: ~1.2 kWh/day
        # Emissions = electricity_factor * 1.2
        "id": "fridge_daily",
        "activity": "Use Fridge (Daily)",
        "unit": "days",
        "emissionFactor": electricity_factor * 1.2,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Freezer: ~1.0 kWh/day
        # Emissions = electricity_factor * 1.0
        "id": "freezer_daily",
        "activity": "Use Freezer (Daily)",
        "unit": "days",
        "emissionFactor": electricity_factor * 1.0,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Toaster: ~0.05 kWh per use (5 minutes)
        # Emissions = electricity_factor * 0.05
        "id": "toaster_use",
        "activity": "Use Toaster",
        "unit": "uses",
        "emissionFactor": electricity_factor * 0.05,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Electric oven: ~3 kW, 1 minute = 0.05 kWh
        # Emissions = electricity_factor * 0.05
        "id": "oven_electric_per_min",
        "activity": "Use Electric Oven",
        "unit": "minutes",
        "emissionFactor": electricity_factor * 0.05,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Coffee machine: ~0.05 kWh per use
        # Emissions = electricity_factor * 0.05
        "id": "coffee_machine_use",
        "activity": "Use Coffee Machine",
        "unit": "uses",
        "emissionFactor": electricity_factor * 0.05,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Hair straighteners: ~0.1 kWh per 10 minutes
        # Emissions = electricity_factor * 0.1
        "id": "hair_straighteners_10min",
        "activity": "Use Hair Straighteners",
        "unit": "10 minutes",
        "emissionFactor": electricity_factor * 0.1,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Gaming console: ~0.1 kWh per hour
        # Emissions = electricity_factor * 0.1
        "id": "gaming_console_per_hour",
        "activity": "Use Gaming Console",
        "unit": "hours",
        "emissionFactor": electricity_factor * 0.1,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Wi-Fi router: ~0.12 kWh/day (5 W continuous)
        # Emissions = electricity_factor * 0.12
        "id": "wifi_router_daily",
        "activity": "Use Wi-Fi Router",
        "unit": "days",
        "emissionFactor": electricity_factor * 0.12,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Tablet: ~0.02 kWh per charge
        # Emissions = electricity_factor * 0.02
        "id": "charge_tablet",
        "activity": "Charge Tablet",
        "unit": "charges",
        "emissionFactor": electricity_factor * 0.02,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Smart speaker: ~0.072 kWh/day (3 W continuous)
        # Emissions = electricity_factor * 0.072
        "id": "smart_speaker_daily",
        "activity": "Use Smart Speaker (Daily)",
        "unit": "days",
        "emissionFactor": electricity_factor * 0.072,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Smart TV: ~0.12 kWh per hour (120 W)
        # Emissions = electricity_factor * 0.12
        "id": "smart_tv_per_hour",
        "activity": "Use Smart TV",
        "unit": "hours",
        "emissionFactor": electricity_factor * 0.12,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Streaming: ~0.015 kWh per hour (network & device overhead)
        # Emissions = electricity_factor * 0.015
        "id": "streaming_video_per_hour",
        "activity": "Stream Video Content",
        "unit": "hours",
        "emissionFactor": electricity_factor * 0.015,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - LED lighting: ~0.009 kWh per hour (9 W)
        # Emissions = electricity_factor * 0.009
        "id": "lighting_led_per_hour",
        "activity": "Use LED Lighting",
        "unit": "hours",
        "emissionFactor": electricity_factor * 0.009,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Incandescent lighting: ~0.06 kWh per hour (60 W)
        # Emissions = electricity_factor * 0.06
        "id": "lighting_incandescent_per_hour",
        "activity": "Use Incandescent Lighting",
        "unit": "hours",
        "emissionFactor": electricity_factor * 0.06,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Printer: ~0.05 kWh per print
        # Emissions = electricity_factor * 0.05
        "id": "printer_use",
        "activity": "Use Home Printer",
        "unit": "uses",
        "emissionFactor": electricity_factor * 0.05,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Electric fan: ~0.05 kWh per hour (50 W)
        # Emissions = electricity_factor * 0.05
        "id": "fan_per_hour",
        "activity": "Use Electric Fan",
        "unit": "hours",
        "emissionFactor": electricity_factor * 0.05,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Robot vacuum: ~0.3 kWh per full cleaning cycle
        # Emissions = electricity_factor * 0.3
        "id": "robot_vacuum_per_use",
        "activity": "Use Robot Vacuum",
        "unit": "uses",
        "emissionFactor": electricity_factor * 0.3,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Handwashing dishes with hot water: 0.12 kWh heating + 2 L water per minute
        # Emissions = electricity_factor * 0.12 + water_factor * 2
        "id": "dish_handwash_hot_per_min",
        "activity": "Handwash Dishes with Hot Water",
        "unit": "minutes",
        "emissionFactor": electricity_factor * 0.12 + water_factor * 2,
        "source": "Estimated using DEFRA 2025 water and electricity factors"
    },
    {
        # Assumptions:
        # - Cold shower: ~12 L/min
        # Emissions = water_factor * 12
        "id": "shower_cold_per_min",
        "activity": "Take a Cold Shower",
        "unit": "minutes",
        "emissionFactor": water_factor * 12,
        "source": "Estimated using DEFRA 2025 water factor"
    },
    {
        # Assumptions:
        # - Smart toilet/bidet: ~0.03 kWh per use
        # Emissions = electricity_factor * 0.03
        "id": "bidet_use",
        "activity": "Use Smart Toilet/Bidet",
        "unit": "uses",
        "emissionFactor": electricity_factor * 0.03,
        "source": "Estimated using DEFRA 2025 electricity factor"
    },
    {
        # Assumptions:
        # - Humidifier/dehumidifier: ~0.2 kWh per hour (200 W)
        # Emissions = electricity_factor * 0.2
        "id": "humidifier_per_hour",
        "activity": "Run Humidifier/Dehumidifier",
        "unit": "hours",
        "emissionFactor": electricity_factor * 0.2,
        "source": "Estimated using DEFRA 2025 electricity factor"
    }
]

# === Post-process and export ===
# Add category metadata and round emission factors for stability/readability
for act in activities:
  act["category"] = "general"
  act["emissionFactor"] = round(act["emissionFactor"], 6)

# Export activities as a JS module
output_dir = "Activities"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "generalActivities.js")

with open(output_path, "w", encoding="utf-8") as f:
  f.write("const generalActivities = [\n")
  for act in activities:
    f.write("  " + json.dumps(act, indent=2) + ",\n")
  f.write("];\n\nexport default generalActivities;\n")

print(f"generalActivities.js written to: {output_path}")
