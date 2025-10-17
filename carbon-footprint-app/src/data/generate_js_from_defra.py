# =============================================================================
#  Script: generate_js_from_defra.py
#
#  Description:
#  Transforms the cleaned DEFRA 2025 emissions table
#  ("pre-processed-defra.csv") into category-scoped JavaScript modules that
#  export arrays of normalised activity objects (stable IDs, user-friendly
#  names, standardised units, averaged CO₂e factors) for front-end calculators.
#
#  Author: Finlay Shaw
# =============================================================================

import pandas as pd
import os, json, re
from pathlib import Path

# =========================
# Config
# =========================
INPUT_CSV = "pre-processed-defra.csv"   # input: cleaned DEFRA factors
OUTPUT_DIR = "Activities"               # output folder for JS modules
SOURCE_LABEL = "DEFRA 2025"             # source label written into JS objects

# Categories to exclude entirely (case-insensitive match after normalisation)
EXCLUDED_CATEGORIES = [
    "WTT- fuels", "WTT- heat and steam", "WTT- UK electricity",
    "Transmission and distribution", "Heat and steam", "UK electricity T&D for EVs",
    "Managed assets- electricity", "Refrigerant & other", "Material use", "WTT- bioenergy",
    "WTT- delivery vehs & freight", "WTT- pass vehs & travel- land", "WTT- business travel- air",
    "WTT- business travel- sea", "Bioenergy", "Managed assets- vehicles",
    "Business travel- land", "Fuels", "Water treatment", "Freighting goods",
]

# Categories we KEEP even if their label would otherwise be considered “unspecified/unknown”
KEEP_UNSPECIFIED_CATEGORIES = {"homeworking", "hotel stay", "water supply", "business travel- sea"}

# Optional: force certain category slugs for stable filenames / backwards-compat
CATEGORY_SLUG_OVERRIDES = {
    "business travel- sea": "business_travel_sea",
    "hotel stay": "hotel_stay",
    "water supply": "water_supply",
}

AVERAGE_VAN_PAYLOAD_KG = 500  # used to convert delivery per km -> per kg·km

# EF unit conversions: map from found unit -> (normalised unit, multiplier on EF)
UNIT_CONVERSIONS = {
    "million litres": ("litres", 1 / 1_000_000),
    "cubic metres": ("litres", 1 / 1000),
    "tonnes": ("kilograms", 1 / 1000),  # per tonne -> per kg
    "grams": ("kilograms", 1000),       # per gram -> per kg
    "kwh": ("wh", 1 / 1000),
    "mwh": ("wh", 1 / 1_000_000),
}
# Unit label normalisations (string replacement only)
UNIT_NORMALISATIONS = {
    "per fte working hour": "FTE working hour",
    "fte working hour": "FTE working hour",
}

# Keywords used to detect fuel-specific delivery vehicle rows
FUEL_KEYWORDS = ["electric", "diesel", "petrol", "plug-in hybrid", "plugin hybrid", "cng", "lpg"]

# Canonical names for passenger vehicle types
VEHICLE_TERMS = {
    "battery electric vehicle": "electric car",
    "battery electric": "electric car",
    "bev": "electric car",
    "plugin hybrid electric vehicle": "plug-in hybrid car",
    "plug-in hybrid": "plug-in hybrid car",
    "plugin hybrid": "plug-in hybrid car",
    "phev": "plug-in hybrid car",
    "hybrid": "hybrid car",
    "petrol": "petrol car",
    "diesel": "diesel car",
    "cng": "CNG car",
    "lpg": "LPG car",
}

# Regex that marks labels as useless (to be dropped) unless in keeplist
USELESS_LABEL_RE = r'(?i)^\s*(unspecified|unknown|na|n/?a|not\s+applicable|not\s+specified|none)\s*$'

# =========================
# Helpers
# =========================
def slugify(text):
    """Lowercase, replace spaces with underscores, keep [a-z0-9_] only."""
    return re.sub(r'[^a-z0-9_]', '', re.sub(r'\s+', '_', str(text).strip().lower()))

def category_slug(category: str) -> str:
    """Category -> filesystem-friendly slug, honoring overrides."""
    c = str(category).strip().lower()
    if c in CATEGORY_SLUG_OVERRIDES:
        return CATEGORY_SLUG_OVERRIDES[c]
    return slugify(category)

def normalise_text(x: str) -> str:
    """Normalise text for matching: lowercase, single spaces, trimmed."""
    x = str(x or "").strip().lower()
    x = re.sub(r"\s+", " ", x)
    return x

def a_or_an(noun: str) -> str:
    """Simple 'a'/'an' helper for nicer titles."""
    return "an" if re.match(r"^[aeiou]", noun) else "a"

def title_tidy(s: str) -> str:
    """Capitalise first letter and tidy after en-dashes."""
    if not s: return s
    s = s[:1].upper() + s[1:]
    return re.sub(r"(–\s*)(\w)", lambda m: m.group(1) + m.group(2).upper(), s)

def passenger_vehicle_name(label: str, unit: str) -> str:
    """Human title for passenger vehicles by fuel type."""
    for key, nice in VEHICLE_TERMS.items():
        if key in label:
            return f"Drive {a_or_an(nice)} {nice} – per {unit}"
    return f"Drive {a_or_an(label)} {label} car – per {unit}"

# Ordered rules: match (category_regex, label_regex_or_None) -> title template (str or callable(row))
RULES = [
    # Delivery vehicles
    (r"delivery vehicles?", r"\belectric\b",        "Receive a delivery (electric van)"),
    (r"delivery vehicles?", r"\bdiesel\b",          "Receive a delivery (diesel van)"),
    (r"delivery vehicles?", r"\bpetrol\b",          "Receive a delivery (petrol van)"),
    (r"delivery vehicles?", r"\bplug-?in hybrid\b", "Receive a delivery (plug-in hybrid van)"),
    (r"delivery vehicles?", r"\bcng\b",             "Receive a delivery (CNG van)"),
    (r"delivery vehicles?", r"\blpg\b",             "Receive a delivery (LPG van)"),
    (r"delivery vehicles?", None,                   "Receive a delivery"),

    # Homeworking
    (r"homeworking", r"\belectricity\b",            "Homeworking (electricity)"),
    (r"homeworking", r"\bheating\b",                "Homeworking (heating)"),
    (r"homeworking", None,                          "Homeworking"),

    # Business travel - air
    (r"business travel.*air|air travel|flight", r"with\s*rf",    "Fly with Radiative Forcing"),
    (r"business travel.*air|air travel|flight", r"without\s*rf", "Fly without Radiative Forcing"),
    (r"business travel.*air|air travel|flight", None,            "Distance travelled by plane"),

    # Business travel - sea
    (r"business travel.*sea|sea travel|boat|ferry", r".+", lambda row: f"Sail ({row['Label']})" if row['Label'].lower() not in ["unspecified", "unknown", "nan"] else "Sail"),
    (r"business travel.*sea|sea travel|boat|ferry", None,         "Distance travelled by boat"),

    # Hotel
    (r"hotel|hotel stay", None, "Stay in a hotel"),

    # UK electricity
    (r"^uk electricity$", None, "Use electricity"),
    (r"^uk electricity for evs$", r"battery electric", "Electric freight (BEV)"),
    (r"^uk electricity for evs$", r"plug-?in hybrid",  "Plug-in hybrid freight"),

    # Water
    (r"water|water supply", None, "Use water"),

    # Waste
    (r"waste", r"landfill",      "Send to landfill"),
    (r"waste", r"closed",        "Recycle (closed-loop)"),
    (r"waste", r"open",          "Recycle (open-loop)"),
    (r"waste", r"compost",       "Compost waste"),
    (r"waste", r"incineration",  "Incinerate waste (with energy recovery)"),
    (r"waste", r"anaerobic",     "Dispose via anaerobic digestion"),
    (r"waste", None,             "Dispose of waste"),
]


# =========================
# Load + clean
# =========================
in_path = Path(INPUT_CSV)
if not in_path.exists():
    raise FileNotFoundError(f"Couldn’t find {in_path.resolve()}")
df = pd.read_csv(in_path)

# Basic trimming + NA handling for key columns
df.columns = [c.strip() for c in df.columns]
for col in ["Category", "Activity", "Description", "Unit"]:
    if col in df.columns:
        df[col] = df[col].astype(str).str.strip().replace({"nan": pd.NA})

# Keep only rows with a category and a numeric EF
df = df[df["Category"].notna() & df["EmissionFactor"].notna()]

# Build a user-facing Label from Description -> Activity -> "Unspecified"
def determine_label(row):
    if pd.notna(row.get("Description")) and str(row["Description"]).strip():
        return row["Description"]
    if pd.notna(row.get("Activity")) and str(row["Activity"]).strip():
        return row["Activity"]
    return "Unspecified"
df["Label"] = df.apply(determine_label, axis=1)

# Drop “useless” labels unless category is explicitly whitelisted
def is_useless(label: str) -> bool:
    return bool(re.match(USELESS_LABEL_RE, str(label) or "", flags=0))

df["_catnorm"] = df["Category"].str.strip().str.lower()
keep_mask = df["_catnorm"].isin(KEEP_UNSPECIFIED_CATEGORIES)
drop_mask = df["Label"].apply(is_useless) & ~keep_mask
df = df[~drop_mask].drop(columns=["_catnorm"])

# Exclude entire categories
df["_catnorm"] = df["Category"].str.strip().str.lower()
excluded = {s.lower() for s in EXCLUDED_CATEGORIES}
df = df[~df["_catnorm"].isin(excluded)].drop(columns=["_catnorm"])

# =========================
# Group / average EF
# =========================
group_cols = ["Category", "Label", "Unit"]
df_grouped = df.groupby(group_cols, as_index=False)["EmissionFactor"].mean()

# Convert miles -> km for travel-related rows
def convert_miles_to_km(row):
    unit = str(row["Unit"]).strip().lower()
    if unit == "miles":
        row["EmissionFactor"] /= 0.621371  # per mile -> per km
        row["Unit"] = "km"
    return row
df_grouped = df_grouped.apply(convert_miles_to_km, axis=1)

# Normalise / scale units to harmonise EF base units and labels
def normalise_units(row):
    unit_original = str(row["Unit"]).strip().lower()
    if unit_original in UNIT_CONVERSIONS:
        new_unit, mult = UNIT_CONVERSIONS[unit_original]
        row["Unit"] = new_unit
        row["EmissionFactor"] *= mult
        lbl = str(row["Label"])
        # If the unit text appears inside the label, update it to the new unit
        if unit_original in lbl.lower():
            row["Label"] = re.sub(re.escape(unit_original), new_unit, lbl, flags=re.IGNORECASE)
    if unit_original in UNIT_NORMALISATIONS:
        row["Unit"] = UNIT_NORMALISATIONS[unit_original]
    return row
df_grouped = df_grouped.apply(normalise_units, axis=1)

# Delivery per km -> per kg·km using average van payload
def convert_to_kgkm_if_delivery(row):
    if str(row["Category"]).strip().lower() == "delivery vehicles" and str(row["Unit"]).strip().lower() == "km":
        row["EmissionFactor"] /= AVERAGE_VAN_PAYLOAD_KG
        row["Unit"] = "kg·km"
    return row
df_grouped = df_grouped.apply(convert_to_kgkm_if_delivery, axis=1)

# === Merge all electric van flavors into a single "electric van" bucket (averaged) ===
def merge_electric_vans(row):
    if row["Category"].strip().lower() == "delivery vehicles":
        if any(keyword in row["Label"].lower() for keyword in [
            "battery electric", "plugin hybrid", "plug-in hybrid"
        ]):
            row["Label"] = "electric van"
    return row
df_grouped = df_grouped.apply(merge_electric_vans, axis=1)

# Re-aggregate to average merged electric van rows
df_grouped = (
    df_grouped
    .groupby(["Category", "Label", "Unit"], as_index=False)["EmissionFactor"]
    .mean()
)

# Keep only fuel-specific delivery rows (filter out generic “delivery vehicles”)
def is_fuel_based_delivery(row):
    if str(row["Category"]).strip().lower() != "delivery vehicles":
        return True
    label = str(row["Label"]).lower()
    return any(fuel in label for fuel in FUEL_KEYWORDS)
df_grouped = df_grouped[df_grouped.apply(is_fuel_based_delivery, axis=1)]

# Round for stability and drop absolute duplicates
df_grouped["EmissionFactor"] = df_grouped["EmissionFactor"].round(8)
df_grouped = df_grouped.drop_duplicates(subset=["Category", "Label", "Unit", "EmissionFactor"])

# =========================
# Friendly names (rule engine)
# =========================
def friendly_name(row):
    """Generate a human-readable activity title using rules + fallbacks."""
    category = normalise_text(row["Category"])
    label = normalise_text(row["Label"])
    unit = normalise_text(row["Unit"])

    # If the label is useless, suppress it in names
    if label in {"unspecified", "unknown", "nan"}:
        label_clean = ""
    else:
        label_clean = label

    # Passenger vehicles (various fuel types)
    if "passenger vehicle" in category:
        for key, nice in VEHICLE_TERMS.items():
            if key in label:
                return title_tidy(f"Drive {a_or_an(nice)} {nice}")
        return title_tidy(f"Drive {a_or_an(label_clean)} {label_clean} car") if label_clean else "Drive a car"

    # UK electricity for EVs: distinguish freight vs passenger
    if category == "uk electricity for evs":
        if "tonne" in unit:  # freight
            for cat_pat, lbl_pat, template in RULES:
                if re.search(cat_pat, category) and (lbl_pat is None or re.search(lbl_pat, label)):
                    if callable(template):
                        return title_tidy(template(row))
                    return title_tidy(template)
            return "Electric freight"
        else:  # passenger EVs
            if re.search(r"battery electric", label):
                return "Drive an electric car"
            if re.search(r"plug-?in hybrid", label):
                return "Drive a plug-in hybrid"
            return "Drive an EV"

    # General rules
    for cat_pat, lbl_pat, template in RULES:
        if not re.search(cat_pat, category):
            continue
        if lbl_pat is not None and not re.search(lbl_pat, label):
            continue

        if callable(template):
            return title_tidy(template(row))
        return title_tidy(template.replace(" – per {unit}", "").format(unit=unit, label=label_clean))

    # Fallback
    return title_tidy(label_clean) if label_clean else "Other activity"


# =========================
# JS objects + output
# =========================
def format_js(row):
    """Row -> JS activity object (with deterministic id, title, units, EF, etc.)."""
    cat_slug = category_slug(row["Category"])
    unit_slug = slugify(row["Unit"])
    label = str(row["Label"]).lower()
    activity = friendly_name(row)

    # Special handling for UK electricity for EVs to keep IDs stable/meaningful
    if cat_slug == "uk_electricity_for_evs":
        if "battery electric" in label:
            id_str = "electric_freight_bev" if "tonne" in unit_slug else "electric_car"
        elif "plugin hybrid" in label or "plug-in hybrid" in label:
            id_str = "plugin_hybrid_freight" if "tonne" in unit_slug else "plugin_hybrid_car"
        else:
            id_str = f"{slugify(label)}_{unit_slug}"
        final_id = f"{cat_slug}_{id_str}"
    else:
        final_id = f"{cat_slug}_{slugify(row['Label'])}_{unit_slug}"

    js_obj = {
        "id": final_id,
        "activity": activity,
        "category": cat_slug,
        "unit": row["Unit"],
        "emissionFactor": round(float(row["EmissionFactor"]), 8),
        "source": SOURCE_LABEL,
    }
    # Delivery vehicles expressed as kg·km require two inputs in UI (weight & distance)
    if str(row["Unit"]).lower() == "kg·km":
        js_obj["userInputs"] = ["weight_kg", "distance_km"]
    return js_obj

# Prepare output directory
out_dir = Path(OUTPUT_DIR)
out_dir.mkdir(parents=True, exist_ok=True)

# Small console summary
print(f" Final rows: {len(df_grouped)}")
print(f" Unique categories: {df_grouped['Category'].nunique()}")
print(" Category breakdown:\n", df_grouped["Category"].value_counts())

# Write one JS module per category: <categorySlug>Activities.js
written = []
for category, group in df_grouped.groupby("Category"):
    cat_slug = category_slug(category)
    written.append(cat_slug)
    js_filename = f"{cat_slug}Activities.js"
    filepath = out_dir / js_filename

    js_objects = [format_js(row) for _, row in group.iterrows()]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"const {cat_slug}Activities = [\n")
        for obj in js_objects:
            f.write("  " + json.dumps(obj, indent=2) + ",\n")
        f.write("];\n\n")
        f.write(f"export default {cat_slug}Activities;\n")
    print(f" JS file created: {filepath}")



