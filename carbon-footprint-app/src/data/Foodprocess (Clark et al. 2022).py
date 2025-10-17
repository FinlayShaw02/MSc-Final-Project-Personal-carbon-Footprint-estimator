# =============================================================================
#  Script: Foodprocess.py
#
#  Description:
#  Generates a JavaScript module (`foodActivities.js`) from the dataset
#  “Environmental impacts of food (Clark et al. 2022).csv”.
#  Each food or drink item is converted into a structured activity object
#  suitable for use in web-based carbon calculators or sustainability apps.
#
#  Author: Finlay Shaw
# =============================================================================


import pandas as pd
import os
import json

# Load the CSV file
csv_path = "Environmental impacts of food (Clark et al. 2022).csv"
df = pd.read_csv(csv_path)

# Normalise column names: lowercase, underscores instead of spaces
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

# === Classification rules ===
# Ordered list of food type keywords.
# Each tuple maps a verb (e.g., "ate") to a list of keywords that define it.
# The first match found determines the classification.
type_keywords = [
    ("drank", [
        # Alcoholic beverages
        "ale", "beer", "cider", "wine",
        # Juices & smoothies
        "apple juice", "orange juice", "grape juice", "pineapple juice", "fruit smoothies",
        # Milk & plant-based milks
        "almond milk", "coconut milk", "cow's milk", "oat milk", "rice milk", "soy milk",
        # Hot drinks
        "coffee beans", "coffee pods", "instant coffee", "tea",
        # Other drinks
        "protein shake", "milkshake"
    ]),
    ("ate", [
        # General food and meals (large curated list)
        "almond butter", "almonds", "apple pie", "apples", "asparagus", "avocados", "bagels", "baguette",
        "bacon", "banana loaf", "bananas", "beans", "beef burger", "beef curry", "beef meatballs",
        "beef mince", "beef noodles", "beef steak", "beetroot", "biscuits", "blue cheese", "brazil nuts",
        "bread", "breakfast cereal", "brie", "broccoli", "butter", "cabbage", "caesar salad", "camembert",
        "carrot cake", "carrots", "cashew nuts", "cauliflower", "cereal bars", "cheddar cheese",
        "cheesecake", "cherry tomatoes", "chia seeds", "chicken breast", "chicken burger", "chicken curry",
        "chicken noodles", "chicken pasta", "chicken sausages", "chicken thighs", "chicken wings",
        "chickpeas", "chilli con carne", "chocolate biscuits", "chocolate cake", "chocolate cereals",
        "chocolate cheesecake", "cookies", "cottage cheese", "courgettes", "cracker biscuits", "crisps",
        "croissants", "dark chocolate", "doughnuts", "egg noodles", "eggs", "falafels", "feta cheese",
        "flapjack", "frozen jacket potatoes", "frozen mashed potato", "frozen onion rings",
        "frozen potato wedges", "frozen roast potatoes", "frozen sweet potato fries", "fruit cake",
        "garden peas", "goat's cheese", "grapes", "granola", "haddock risotto", "halloumi cheese",
        "ice cream", "ice lollies", "kale", "kiwis", "lamb (leg)", "lamb burgers", "lamb casserole",
        "lamb chops", "lamb curry", "lamb hotpot", "lamb moussaka", "lasagne sheets", "lemon", "lentils",
        "lettuce", "lime", "macaroni cheese", "mackerel", "meat pizza", "meat-free burger",
        "meat-free mince", "meat-free nuggets", "meat-free sausages", "melon", "milk chocolate", "mixed salad",
        "mozzarella cheese", "muesli", "muffins", "mushrooms", "naan", "nut loaf", "onions", "oranges",
        "pain au chocolat", "pancakes", "parmesan cheese", "parsnips", "pasta shells", "peanut butter",
        "peanuts", "pears", "pecan nuts", "penne pasta", "peppers", "pineapple", "pitta bread", "pizza",
        "poppadoms", "popcorn", "pork chops", "pork loin", "pork sausage rolls", "pork sausages",
        "porridge (oatmeal)", "potato croquettes", "potatoes", "prawns", "protein bar", "quiche", "quinoa",
        "raspberries", "rice", "rice noodles", "ricotta cheese", "salmon", "salmon fishcakes", "sandwich",
        "sausage", "sausage rolls", "shepherd's pie", "shortbread biscuits", "sourdough bread", "soy desert",
        "soy yoghurt", "spaghetti", "spaghetti bolognese", "spinach", "sponge cake", "strawberries",
        "strawberry jam", "sugar", "sweetcorn", "tofu", "tomato ketchup", "tomatoes", "tortilla wraps",
        "tuna", "vegetable lasagne", "vegetarian chilli con carne", "vegetarian curry", "vegetarian pizza",
        "walnuts", "watermelon", "yoghurt", "steak pie"
    ]),
    ("used", [
        # Condiments and oils
        "apricot jam", "raspberry jam", "jam", "marmalade", "olive oil", "rapeseed oil", "sunflower oil",
        "chocolate spread", "coconut oil", "spread"
    ])
]

# === Verb and unit mapping ===
# Maps the classification type to a display verb and measurement unit
verb_map = {"ate": "Eat", "drank": "Drink", "used": "Use"}
unit_map = {"drank": "litres", "ate": "kg", "used": "kg"}

# === Build structured list of activities ===
activities = []
for _, row in df.iterrows():
    entity = str(row["entity"]).strip()  # Food or drink name
    ghg = row["ghg_kg"]                  # GHG emissions per kg
    if pd.isna(ghg):
        continue  # Skip missing emission factors

    # Clean the entity name into a consistent ID format
    clean_id = "food_" + (
        entity.lower()
        .replace(" ", "_")
        .replace(",", "")
        .replace("(", "")
        .replace(")", "")
        .replace("'", "")
    )

    # Determine food type (ate, drank, used, or fallback)
    entity_lower = entity.lower()
    food_type = "other"
    for t_type, keywords in type_keywords:
        if any(keyword in entity_lower for keyword in keywords):
            food_type = t_type
            break

    # Determine the correct verb and unit
    verb = verb_map.get(food_type, "Consume")
    unit = unit_map.get(food_type, "kg")

    # Construct activity dictionary
    activity = {
        "id": clean_id,
        "activity": f"{verb} {entity}",
        "unit": unit,
        "emissionFactor": round(ghg, 6),
        "source": "Clark et al. 2022 (kg CO₂e per kg product; litres assumed equivalent for drinks)",
        "category": "food",
        "type": food_type
    }
    activities.append(activity)

# === Export to JavaScript ===
# Creates a file `foodActivities.js` containing a const array of all activities

output_dir = "Activities"
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, "foodActivities.js")

# Write JS array declaration and export
with open(output_file, "w", encoding="utf-8") as f:
    f.write("const foodActivities = [\n")
    for i, act in enumerate(activities):
        is_last = i == len(activities) - 1
        f.write("  " + json.dumps(act, indent=2) + (",\n" if not is_last else "\n"))
    f.write("];\n\nexport default foodActivities;\n")

print(f"JS file created: {output_file}")
