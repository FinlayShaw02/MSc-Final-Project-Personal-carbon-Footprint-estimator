const foodActivities = [
  {
  "id": "food_ale",
  "activity": "Drink Ale",
  "unit": "litres",
  "emissionFactor": 0.48869,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_almond_butter",
  "activity": "Eat Almond butter",
  "unit": "kg",
  "emissionFactor": 0.387011,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_almond_milk",
  "activity": "Drink Almond milk",
  "unit": "litres",
  "emissionFactor": 0.655888,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_almonds",
  "activity": "Eat Almonds",
  "unit": "kg",
  "emissionFactor": 0.602368,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_apple_juice",
  "activity": "Drink Apple juice",
  "unit": "litres",
  "emissionFactor": 0.458378,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_apple_pie",
  "activity": "Eat Apple pie",
  "unit": "kg",
  "emissionFactor": 1.244974,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_apples",
  "activity": "Eat Apples",
  "unit": "kg",
  "emissionFactor": 0.507354,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_apricot_jam",
  "activity": "Use Apricot jam",
  "unit": "kg",
  "emissionFactor": 1.382105,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "used"
},
  {
  "id": "food_asparagus",
  "activity": "Eat Asparagus",
  "unit": "kg",
  "emissionFactor": 0.925692,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_avocados",
  "activity": "Eat Avocados",
  "unit": "kg",
  "emissionFactor": 0.921227,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_bacon",
  "activity": "Eat Bacon",
  "unit": "kg",
  "emissionFactor": 19.314209,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_bagels",
  "activity": "Eat Bagels",
  "unit": "kg",
  "emissionFactor": 0.802813,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_baguette",
  "activity": "Eat Baguette",
  "unit": "kg",
  "emissionFactor": 0.995644,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_banana_loaf",
  "activity": "Eat Banana loaf",
  "unit": "kg",
  "emissionFactor": 1.868787,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_bananas",
  "activity": "Eat Bananas",
  "unit": "kg",
  "emissionFactor": 0.87335,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_beans",
  "activity": "Eat Beans",
  "unit": "kg",
  "emissionFactor": 1.373308,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_beef_burger",
  "activity": "Eat Beef burger",
  "unit": "kg",
  "emissionFactor": 53.976371,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_beef_curry",
  "activity": "Eat Beef curry",
  "unit": "kg",
  "emissionFactor": 17.368725,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_beef_meatballs",
  "activity": "Eat Beef meatballs",
  "unit": "kg",
  "emissionFactor": 70.787474,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_beef_mince",
  "activity": "Eat Beef mince",
  "unit": "kg",
  "emissionFactor": 95.034572,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_beef_noodles",
  "activity": "Eat Beef noodles",
  "unit": "kg",
  "emissionFactor": 2.290114,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_beef_steak",
  "activity": "Drink Beef steak",
  "unit": "litres",
  "emissionFactor": 129.747715,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_beer",
  "activity": "Drink Beer",
  "unit": "litres",
  "emissionFactor": 0.686283,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_beetroot",
  "activity": "Eat Beetroot",
  "unit": "kg",
  "emissionFactor": 2.658241,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_biscuits",
  "activity": "Eat Biscuits",
  "unit": "kg",
  "emissionFactor": 3.989251,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_blue_cheese",
  "activity": "Eat Blue cheese",
  "unit": "kg",
  "emissionFactor": 20.105753,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_brazil_nuts",
  "activity": "Eat Brazil nuts",
  "unit": "kg",
  "emissionFactor": 2.513051,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_bread",
  "activity": "Eat Bread",
  "unit": "kg",
  "emissionFactor": 0.878761,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_breakfast_cereal",
  "activity": "Eat Breakfast cereal",
  "unit": "kg",
  "emissionFactor": 1.493427,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_brie",
  "activity": "Eat Brie",
  "unit": "kg",
  "emissionFactor": 19.139581,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_broccoli",
  "activity": "Eat Broccoli",
  "unit": "kg",
  "emissionFactor": 0.897402,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_butter",
  "activity": "Eat Butter",
  "unit": "kg",
  "emissionFactor": 3.324503,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cabbage",
  "activity": "Eat Cabbage",
  "unit": "kg",
  "emissionFactor": 0.890284,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_caesar_salad",
  "activity": "Eat Caesar salad",
  "unit": "kg",
  "emissionFactor": 2.079189,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_camembert",
  "activity": "Eat Camembert",
  "unit": "kg",
  "emissionFactor": 16.28143,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_carrot_cake",
  "activity": "Eat Carrot cake",
  "unit": "kg",
  "emissionFactor": 2.010722,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_carrots",
  "activity": "Eat Carrots",
  "unit": "kg",
  "emissionFactor": 0.935163,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cashew_nuts",
  "activity": "Eat Cashew nuts",
  "unit": "kg",
  "emissionFactor": 2.087644,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cauliflower",
  "activity": "Eat Cauliflower",
  "unit": "kg",
  "emissionFactor": 0.891726,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cereal_bars",
  "activity": "Eat Cereal bars",
  "unit": "kg",
  "emissionFactor": 2.853384,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cheddar_cheese",
  "activity": "Eat Cheddar cheese",
  "unit": "kg",
  "emissionFactor": 20.749045,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cheesecake",
  "activity": "Eat Cheesecake",
  "unit": "kg",
  "emissionFactor": 2.369302,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cherry_tomatoes",
  "activity": "Eat Cherry tomatoes",
  "unit": "kg",
  "emissionFactor": 2.26636,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chia_seeds",
  "activity": "Eat Chia seeds",
  "unit": "kg",
  "emissionFactor": 1.220554,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chicken_breast",
  "activity": "Eat Chicken breast",
  "unit": "kg",
  "emissionFactor": 9.272323,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chicken_burger",
  "activity": "Eat Chicken burger",
  "unit": "kg",
  "emissionFactor": 5.434487,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chicken_curry",
  "activity": "Eat Chicken curry",
  "unit": "kg",
  "emissionFactor": 3.616546,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chicken_noodles",
  "activity": "Eat Chicken noodles",
  "unit": "kg",
  "emissionFactor": 2.383996,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chicken_pasta",
  "activity": "Eat Chicken pasta",
  "unit": "kg",
  "emissionFactor": 2.946765,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chicken_sausages",
  "activity": "Eat Chicken sausages",
  "unit": "kg",
  "emissionFactor": 8.164302,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chicken_thighs",
  "activity": "Eat Chicken thighs",
  "unit": "kg",
  "emissionFactor": 9.981881,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chicken_wings",
  "activity": "Eat Chicken wings",
  "unit": "kg",
  "emissionFactor": 9.583456,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chickpeas",
  "activity": "Eat Chickpeas",
  "unit": "kg",
  "emissionFactor": 1.344353,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chilli_con_carne",
  "activity": "Eat Chilli con carne",
  "unit": "kg",
  "emissionFactor": 13.540805,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chocolate_biscuits",
  "activity": "Eat Chocolate biscuits",
  "unit": "kg",
  "emissionFactor": 5.083679,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chocolate_cake",
  "activity": "Eat Chocolate cake",
  "unit": "kg",
  "emissionFactor": 3.952118,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chocolate_cereals",
  "activity": "Eat Chocolate cereals",
  "unit": "kg",
  "emissionFactor": 2.877626,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chocolate_cheesecake",
  "activity": "Eat Chocolate cheesecake",
  "unit": "kg",
  "emissionFactor": 4.900424,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_chocolate_spread",
  "activity": "Use Chocolate spread",
  "unit": "kg",
  "emissionFactor": 5.3723,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "used"
},
  {
  "id": "food_cider",
  "activity": "Drink Cider",
  "unit": "litres",
  "emissionFactor": 1.081633,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_coconut_milk",
  "activity": "Drink Coconut milk",
  "unit": "litres",
  "emissionFactor": 3.31999,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_coconut_oil",
  "activity": "Use Coconut oil",
  "unit": "kg",
  "emissionFactor": 0.528741,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "used"
},
  {
  "id": "food_cod",
  "activity": "Consume Cod",
  "unit": "kg",
  "emissionFactor": 10.904109,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_cod_fish_fingers",
  "activity": "Consume Cod fish fingers",
  "unit": "kg",
  "emissionFactor": 9.313182,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_cod_fishcakes",
  "activity": "Consume Cod fishcakes",
  "unit": "kg",
  "emissionFactor": 7.815675,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_coffee_beans",
  "activity": "Drink Coffee beans",
  "unit": "litres",
  "emissionFactor": 16.824608,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_coffee_pods",
  "activity": "Drink Coffee pods",
  "unit": "litres",
  "emissionFactor": 20.299764,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_cookies",
  "activity": "Eat Cookies",
  "unit": "kg",
  "emissionFactor": 3.357278,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cottage_cheese",
  "activity": "Eat Cottage cheese",
  "unit": "kg",
  "emissionFactor": 25.278503,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cottage_pie",
  "activity": "Consume Cottage pie",
  "unit": "kg",
  "emissionFactor": 11.851271,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_courgettes",
  "activity": "Eat Courgettes",
  "unit": "kg",
  "emissionFactor": 0.846479,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_couscous",
  "activity": "Consume Couscous",
  "unit": "kg",
  "emissionFactor": 1.157979,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_cows_milk",
  "activity": "Drink Cow's milk",
  "unit": "litres",
  "emissionFactor": 3.703237,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_cracker_biscuits",
  "activity": "Eat Cracker biscuits",
  "unit": "kg",
  "emissionFactor": 2.448466,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_crisps",
  "activity": "Eat Crisps",
  "unit": "kg",
  "emissionFactor": 3.031724,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_croissants",
  "activity": "Eat Croissants",
  "unit": "kg",
  "emissionFactor": 1.682228,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_cucumber",
  "activity": "Consume Cucumber",
  "unit": "kg",
  "emissionFactor": 0.847114,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_dairy-free_cheese",
  "activity": "Consume Dairy-free cheese",
  "unit": "kg",
  "emissionFactor": 1.976174,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_dairy-free_ice_cream",
  "activity": "Eat Dairy-free ice cream",
  "unit": "kg",
  "emissionFactor": 2.451197,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_dark_chocolate",
  "activity": "Eat Dark chocolate",
  "unit": "kg",
  "emissionFactor": 20.620037,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_doughnuts",
  "activity": "Eat Doughnuts",
  "unit": "kg",
  "emissionFactor": 2.199665,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_egg_noodles",
  "activity": "Eat Egg noodles",
  "unit": "kg",
  "emissionFactor": 1.381512,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_eggs",
  "activity": "Eat Eggs",
  "unit": "kg",
  "emissionFactor": 4.4366,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_falafels",
  "activity": "Eat Falafels",
  "unit": "kg",
  "emissionFactor": 1.098106,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_feta_cheese",
  "activity": "Eat Feta cheese",
  "unit": "kg",
  "emissionFactor": 14.838609,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_flapjack",
  "activity": "Eat Flapjack",
  "unit": "kg",
  "emissionFactor": 1.947683,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_frozen_chips_french_fries",
  "activity": "Consume Frozen chips (french fries)",
  "unit": "kg",
  "emissionFactor": 0.753472,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_frozen_jacket_potatoes",
  "activity": "Eat Frozen jacket potatoes",
  "unit": "kg",
  "emissionFactor": 0.51752,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_frozen_mashed_potato",
  "activity": "Eat Frozen mashed potato",
  "unit": "kg",
  "emissionFactor": 0.826643,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_frozen_onion_rings",
  "activity": "Eat Frozen onion rings",
  "unit": "kg",
  "emissionFactor": 0.771175,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_frozen_potato_wedges",
  "activity": "Eat Frozen potato wedges",
  "unit": "kg",
  "emissionFactor": 0.664775,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_frozen_roast_potatoes",
  "activity": "Eat Frozen roast potatoes",
  "unit": "kg",
  "emissionFactor": 1.203417,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_frozen_sweet_potato_fries",
  "activity": "Eat Frozen sweet potato fries",
  "unit": "kg",
  "emissionFactor": 0.409885,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_fruit_cake",
  "activity": "Eat Fruit cake",
  "unit": "kg",
  "emissionFactor": 3.452116,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_fruit_smoothies",
  "activity": "Drink Fruit smoothies",
  "unit": "litres",
  "emissionFactor": 1.648915,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_garden_peas",
  "activity": "Eat Garden peas",
  "unit": "kg",
  "emissionFactor": 1.003837,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_goats_cheese",
  "activity": "Eat Goat's cheese",
  "unit": "kg",
  "emissionFactor": 19.312073,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_granola",
  "activity": "Eat Granola",
  "unit": "kg",
  "emissionFactor": 1.781193,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_grapes",
  "activity": "Eat Grapes",
  "unit": "kg",
  "emissionFactor": 8.278876,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_haddock_risotto",
  "activity": "Eat Haddock risotto",
  "unit": "kg",
  "emissionFactor": 4.898891,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_halloumi_cheese",
  "activity": "Eat Halloumi cheese",
  "unit": "kg",
  "emissionFactor": 16.172452,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_ice_cream",
  "activity": "Eat Ice cream",
  "unit": "kg",
  "emissionFactor": 3.661809,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_ice_lollies",
  "activity": "Eat Ice lollies",
  "unit": "kg",
  "emissionFactor": 1.314393,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_instant_coffee",
  "activity": "Drink Instant coffee",
  "unit": "litres",
  "emissionFactor": 28.783641,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_kale",
  "activity": "Drink Kale",
  "unit": "litres",
  "emissionFactor": 0.903419,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_kiwis",
  "activity": "Eat Kiwis",
  "unit": "kg",
  "emissionFactor": 1.613707,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lamb_leg",
  "activity": "Eat Lamb (leg)",
  "unit": "kg",
  "emissionFactor": 30.740947,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lamb_burgers",
  "activity": "Eat Lamb burgers",
  "unit": "kg",
  "emissionFactor": 26.928289,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lamb_casserole",
  "activity": "Eat Lamb casserole",
  "unit": "kg",
  "emissionFactor": 30.87731,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lamb_chops",
  "activity": "Eat Lamb chops",
  "unit": "kg",
  "emissionFactor": 30.901993,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lamb_curry",
  "activity": "Eat Lamb curry",
  "unit": "kg",
  "emissionFactor": 10.192565,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lamb_hotpot",
  "activity": "Eat Lamb Hotpot",
  "unit": "kg",
  "emissionFactor": 11.226254,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lamb_moussaka",
  "activity": "Eat Lamb moussaka",
  "unit": "kg",
  "emissionFactor": 7.259162,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lasagne_sheets",
  "activity": "Eat Lasagne sheets",
  "unit": "kg",
  "emissionFactor": 1.961382,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lemons",
  "activity": "Eat Lemons",
  "unit": "kg",
  "emissionFactor": 0.470153,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lentils",
  "activity": "Eat Lentils",
  "unit": "kg",
  "emissionFactor": 2.53652,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_lettuce",
  "activity": "Eat Lettuce",
  "unit": "kg",
  "emissionFactor": 4.926023,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_limes",
  "activity": "Eat Limes",
  "unit": "kg",
  "emissionFactor": 0.463008,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_macaroni_cheese",
  "activity": "Eat Macaroni cheese",
  "unit": "kg",
  "emissionFactor": 16.849313,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_mackerel",
  "activity": "Eat Mackerel",
  "unit": "kg",
  "emissionFactor": 13.606384,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_marmalade",
  "activity": "Use Marmalade",
  "unit": "kg",
  "emissionFactor": 1.548921,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "used"
},
  {
  "id": "food_meat_pizza",
  "activity": "Eat Meat pizza",
  "unit": "kg",
  "emissionFactor": 7.40066,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_meat-free_burger",
  "activity": "Eat Meat-free burger",
  "unit": "kg",
  "emissionFactor": 1.018329,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_meat-free_mince",
  "activity": "Eat Meat-free mince",
  "unit": "kg",
  "emissionFactor": 0.877038,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_meat-free_nuggets",
  "activity": "Eat Meat-free nuggets",
  "unit": "kg",
  "emissionFactor": 0.861847,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_meat-free_sausages",
  "activity": "Eat Meat-free sausages",
  "unit": "kg",
  "emissionFactor": 0.962558,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_melon",
  "activity": "Eat Melon",
  "unit": "kg",
  "emissionFactor": 1.056536,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_milk_chocolate",
  "activity": "Eat Milk chocolate",
  "unit": "kg",
  "emissionFactor": 10.800275,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_mixed_salad",
  "activity": "Eat Mixed salad",
  "unit": "kg",
  "emissionFactor": 0.9209,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_mozzarella_cheese",
  "activity": "Eat Mozzarella cheese",
  "unit": "kg",
  "emissionFactor": 16.2332,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_muesli",
  "activity": "Eat Muesli",
  "unit": "kg",
  "emissionFactor": 2.271911,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_muffins",
  "activity": "Eat Muffins",
  "unit": "kg",
  "emissionFactor": 2.583631,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_mushrooms",
  "activity": "Eat Mushrooms",
  "unit": "kg",
  "emissionFactor": 2.352917,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_naan",
  "activity": "Eat Naan",
  "unit": "kg",
  "emissionFactor": 1.013234,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_nut_loaf",
  "activity": "Eat Nut loaf",
  "unit": "kg",
  "emissionFactor": 0.716131,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_oat_milk",
  "activity": "Drink Oat milk",
  "unit": "litres",
  "emissionFactor": 0.453281,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_olive_oil",
  "activity": "Use Olive oil",
  "unit": "kg",
  "emissionFactor": 5.184628,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "used"
},
  {
  "id": "food_onions",
  "activity": "Eat Onions",
  "unit": "kg",
  "emissionFactor": 0.36286,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_orange_juice",
  "activity": "Drink Orange juice",
  "unit": "litres",
  "emissionFactor": 0.488848,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_oranges",
  "activity": "Eat Oranges",
  "unit": "kg",
  "emissionFactor": 0.46655,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pain_au_chocolat",
  "activity": "Eat Pain au chocolat",
  "unit": "kg",
  "emissionFactor": 2.809512,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pancakes",
  "activity": "Eat Pancakes",
  "unit": "kg",
  "emissionFactor": 1.547809,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_parmesan_cheese",
  "activity": "Eat Parmesan cheese",
  "unit": "kg",
  "emissionFactor": 24.01648,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_parsnips",
  "activity": "Eat Parsnips",
  "unit": "kg",
  "emissionFactor": 0.989607,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pasta_shells",
  "activity": "Eat Pasta shells",
  "unit": "kg",
  "emissionFactor": 1.025583,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_peanut_butter",
  "activity": "Eat Peanut butter",
  "unit": "kg",
  "emissionFactor": 3.43496,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_peanuts",
  "activity": "Eat Peanuts",
  "unit": "kg",
  "emissionFactor": 3.146227,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pears",
  "activity": "Eat Pears",
  "unit": "kg",
  "emissionFactor": 0.925555,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pecan_nuts",
  "activity": "Eat Pecan nuts",
  "unit": "kg",
  "emissionFactor": 2.515942,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_penne_pasta",
  "activity": "Eat Penne pasta",
  "unit": "kg",
  "emissionFactor": 1.625107,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_peppers",
  "activity": "Eat Peppers",
  "unit": "kg",
  "emissionFactor": 0.918662,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pineapple",
  "activity": "Eat Pineapple",
  "unit": "kg",
  "emissionFactor": 0.932008,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pitta_bread",
  "activity": "Eat Pitta bread",
  "unit": "kg",
  "emissionFactor": 0.563561,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_popcorn",
  "activity": "Eat Popcorn",
  "unit": "kg",
  "emissionFactor": 1.813626,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_poppadoms",
  "activity": "Eat Poppadoms",
  "unit": "kg",
  "emissionFactor": 1.500618,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pork_chops",
  "activity": "Eat Pork chops",
  "unit": "kg",
  "emissionFactor": 12.163891,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pork_loin",
  "activity": "Eat Pork loin",
  "unit": "kg",
  "emissionFactor": 11.976514,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pork_sausage_rolls",
  "activity": "Eat Pork sausage rolls",
  "unit": "kg",
  "emissionFactor": 6.186894,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_pork_sausages",
  "activity": "Eat Pork sausages",
  "unit": "kg",
  "emissionFactor": 9.767878,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_porridge_oatmeal",
  "activity": "Eat Porridge (oatmeal)",
  "unit": "kg",
  "emissionFactor": 1.555169,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_potato_croquettes",
  "activity": "Eat Potato croquettes",
  "unit": "kg",
  "emissionFactor": 0.774225,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_potatoes",
  "activity": "Eat Potatoes",
  "unit": "kg",
  "emissionFactor": 0.207276,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_prawn_crackers",
  "activity": "Consume Prawn crackers",
  "unit": "kg",
  "emissionFactor": 4.932853,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_prawns",
  "activity": "Eat Prawns",
  "unit": "kg",
  "emissionFactor": 20.911283,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_protein_bar",
  "activity": "Eat Protein bar",
  "unit": "kg",
  "emissionFactor": 3.372851,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_protein_shake",
  "activity": "Drink Protein shake",
  "unit": "litres",
  "emissionFactor": 1.743729,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_pumpkin_seeds",
  "activity": "Consume Pumpkin seeds",
  "unit": "kg",
  "emissionFactor": 1.323975,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_quiche",
  "activity": "Eat Quiche",
  "unit": "kg",
  "emissionFactor": 4.666833,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_quinoa",
  "activity": "Eat Quinoa",
  "unit": "kg",
  "emissionFactor": 1.138642,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_rapeseed_oil",
  "activity": "Use Rapeseed oil",
  "unit": "kg",
  "emissionFactor": 3.288695,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "used"
},
  {
  "id": "food_raspberries",
  "activity": "Eat Raspberries",
  "unit": "kg",
  "emissionFactor": 8.370972,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_raspberry_jam",
  "activity": "Use Raspberry jam",
  "unit": "kg",
  "emissionFactor": 5.107338,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "used"
},
  {
  "id": "food_rice",
  "activity": "Eat Rice",
  "unit": "kg",
  "emissionFactor": 3.92591,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_rice_milk",
  "activity": "Drink Rice milk",
  "unit": "litres",
  "emissionFactor": 1.441797,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_rice_noodles",
  "activity": "Eat Rice noodles",
  "unit": "kg",
  "emissionFactor": 3.411126,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_ricotta_cheese",
  "activity": "Eat Ricotta cheese",
  "unit": "kg",
  "emissionFactor": 16.294974,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_salmon",
  "activity": "Eat Salmon",
  "unit": "kg",
  "emissionFactor": 10.412581,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_salmon_fishcakes",
  "activity": "Eat Salmon fishcakes",
  "unit": "kg",
  "emissionFactor": 6.505735,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_sausage_rolls",
  "activity": "Eat Sausage rolls",
  "unit": "kg",
  "emissionFactor": 5.849549,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_shepherds_pie",
  "activity": "Eat Shepherd's pie",
  "unit": "kg",
  "emissionFactor": 7.737125,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_shortbread_biscuits",
  "activity": "Eat Shortbread biscuits",
  "unit": "kg",
  "emissionFactor": 2.223783,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_sourdough_bread",
  "activity": "Eat Sourdough bread",
  "unit": "kg",
  "emissionFactor": 0.851167,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_soy_desert",
  "activity": "Eat Soy desert",
  "unit": "kg",
  "emissionFactor": 1.087264,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_soy_milk",
  "activity": "Drink Soy milk",
  "unit": "litres",
  "emissionFactor": 0.893108,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_soy_yoghurt",
  "activity": "Eat Soy yoghurt",
  "unit": "kg",
  "emissionFactor": 0.49602,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_spaghetti",
  "activity": "Eat Spaghetti",
  "unit": "kg",
  "emissionFactor": 1.646015,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_spaghetti_bolognese",
  "activity": "Eat Spaghetti bolognese",
  "unit": "kg",
  "emissionFactor": 7.834703,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_spinach",
  "activity": "Eat Spinach",
  "unit": "kg",
  "emissionFactor": 1.009128,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_sponge_cake",
  "activity": "Eat Sponge cake",
  "unit": "kg",
  "emissionFactor": 1.877448,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_steak_pie",
  "activity": "Drink Steak pie",
  "unit": "litres",
  "emissionFactor": 7.101864,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_strawberries",
  "activity": "Eat Strawberries",
  "unit": "kg",
  "emissionFactor": 3.241715,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_strawberry_jam",
  "activity": "Eat Strawberry jam",
  "unit": "kg",
  "emissionFactor": 2.596663,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_sugar",
  "activity": "Eat Sugar",
  "unit": "kg",
  "emissionFactor": 1.851686,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_sunflower_oil",
  "activity": "Use Sunflower oil",
  "unit": "kg",
  "emissionFactor": 3.661397,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "used"
},
  {
  "id": "food_sunflower_seeds",
  "activity": "Consume Sunflower seeds",
  "unit": "kg",
  "emissionFactor": 1.934424,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "other"
},
  {
  "id": "food_sweetcorn",
  "activity": "Eat Sweetcorn",
  "unit": "kg",
  "emissionFactor": 0.971203,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_tea",
  "activity": "Drink Tea",
  "unit": "litres",
  "emissionFactor": 17.621044,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_tofu",
  "activity": "Eat Tofu",
  "unit": "kg",
  "emissionFactor": 1.020865,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_tomato_ketchup",
  "activity": "Eat Tomato ketchup",
  "unit": "kg",
  "emissionFactor": 2.609794,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_tomatoes",
  "activity": "Eat Tomatoes",
  "unit": "kg",
  "emissionFactor": 2.271515,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_tortilla_wraps",
  "activity": "Eat Tortilla wraps",
  "unit": "kg",
  "emissionFactor": 0.948584,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_tuna",
  "activity": "Eat Tuna",
  "unit": "kg",
  "emissionFactor": 13.075355,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_vegan_pizza",
  "activity": "Eat Vegan pizza",
  "unit": "kg",
  "emissionFactor": 1.948104,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_vegetable_lasagne",
  "activity": "Eat Vegetable lasagne",
  "unit": "kg",
  "emissionFactor": 3.376141,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_vegetarian_chilli_con_carne",
  "activity": "Eat Vegetarian chilli con carne",
  "unit": "kg",
  "emissionFactor": 1.429291,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_vegetarian_curry",
  "activity": "Eat Vegetarian curry",
  "unit": "kg",
  "emissionFactor": 1.309165,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_vegetarian_pizza",
  "activity": "Eat Vegetarian pizza",
  "unit": "kg",
  "emissionFactor": 5.232976,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_walnuts",
  "activity": "Eat Walnuts",
  "unit": "kg",
  "emissionFactor": 2.416308,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_watermelon",
  "activity": "Eat Watermelon",
  "unit": "kg",
  "emissionFactor": 0.969403,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
},
  {
  "id": "food_wine",
  "activity": "Drink Wine",
  "unit": "litres",
  "emissionFactor": 1.722881,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "drank"
},
  {
  "id": "food_yoghurt",
  "activity": "Eat Yoghurt",
  "unit": "kg",
  "emissionFactor": 3.111811,
  "source": "Clark et al. 2022 (kg CO\u2082e per kg product; litres assumed equivalent for drinks)",
  "category": "food",
  "type": "ate"
}
];

export default foodActivities;
