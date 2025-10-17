const generalActivities = [
  {
  "id": "shower_hot_per_min",
  "activity": "Take a Hot Shower",
  "unit": "minutes",
  "emissionFactor": 1.115584,
  "source": "Estimated using DEFRA 2025 water and electricity factors",
  "category": "general"
},
  {
  "id": "bath_hot_avg",
  "activity": "Take a Hot Bath (Full Tub)",
  "unit": "uses",
  "emissionFactor": 7.958785,
  "source": "Estimated using DEFRA 2025 water and electricity factors",
  "category": "general"
},
  {
  "id": "boil_kettle_full",
  "activity": "Boil Electric Kettle (Full 1.5L)",
  "unit": "uses",
  "emissionFactor": 0.0177,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "microwave_per_min",
  "activity": "Use Microwave",
  "unit": "minutes",
  "emissionFactor": 0.0177,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "electric_hob_per_min",
  "activity": "Cook Using Electric Hob",
  "unit": "minutes",
  "emissionFactor": 0.02832,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "gas_hob_per_min",
  "activity": "Cook Using Gas Hob",
  "unit": "minutes",
  "emissionFactor": 0.019186,
  "source": "Estimated using DEFRA 2025 natural gas factor",
  "category": "general"
},
  {
  "id": "dishwasher_use",
  "activity": "Run Dishwasher",
  "unit": "uses",
  "emissionFactor": 1.101048,
  "source": "Estimated using DEFRA 2025 electricity and water factors",
  "category": "general"
},
  {
  "id": "washing_machine_use",
  "activity": "Run Washing Machine",
  "unit": "uses",
  "emissionFactor": 4.67334,
  "source": "Estimated using DEFRA 2025 electricity and water factors",
  "category": "general"
},
  {
  "id": "tumble_dryer_use",
  "activity": "Use Tumble Dryer",
  "unit": "uses",
  "emissionFactor": 0.3894,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "charge_phone",
  "activity": "Charge Smartphone",
  "unit": "charges",
  "emissionFactor": 0.00708,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "use_tv_per_min",
  "activity": "Watch TV",
  "unit": "minutes",
  "emissionFactor": 0.00177,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "use_laptop_per_min",
  "activity": "Use Laptop",
  "unit": "minutes",
  "emissionFactor": 0.000531,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "use_desktop_pc_per_min",
  "activity": "Use Desktop PC",
  "unit": "minutes",
  "emissionFactor": 0.000708,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "hairdryer_10_min",
  "activity": "Dry Hair with Hairdryer",
  "unit": "10 minutes",
  "emissionFactor": 0.0354,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "brush_teeth_tap_per_min",
  "activity": "Brush Teeth with Tap Running",
  "unit": "minutes",
  "emissionFactor": 0.543809,
  "source": "Estimated using DEFRA 2025 water factor",
  "category": "general"
},
  {
  "id": "electric_toothbrush_charge",
  "activity": "Use Electric Toothbrush",
  "unit": "charges",
  "emissionFactor": 0.000531,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "vacuum_clean_per_room",
  "activity": "Vacuum a Room",
  "unit": "uses",
  "emissionFactor": 0.0531,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "iron_clothes_per_hour",
  "activity": "Iron Clothes",
  "unit": "hours",
  "emissionFactor": 0.4248,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "use_ac_heater_per_hour",
  "activity": "Use Air Conditioner or Heater",
  "unit": "hours",
  "emissionFactor": 0.354,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "fridge_daily",
  "activity": "Use Fridge (Daily)",
  "unit": "days",
  "emissionFactor": 0.2124,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "freezer_daily",
  "activity": "Use Freezer (Daily)",
  "unit": "days",
  "emissionFactor": 0.177,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "toaster_use",
  "activity": "Use Toaster",
  "unit": "uses",
  "emissionFactor": 0.00885,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "oven_electric_per_min",
  "activity": "Use Electric Oven",
  "unit": "minutes",
  "emissionFactor": 0.00885,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "coffee_machine_use",
  "activity": "Use Coffee Machine",
  "unit": "uses",
  "emissionFactor": 0.00885,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "hair_straighteners_10min",
  "activity": "Use Hair Straighteners",
  "unit": "10 minutes",
  "emissionFactor": 0.0177,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "gaming_console_per_hour",
  "activity": "Use Gaming Console",
  "unit": "hours",
  "emissionFactor": 0.0177,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "wifi_router_daily",
  "activity": "Use Wi-Fi Router",
  "unit": "days",
  "emissionFactor": 0.02124,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "charge_tablet",
  "activity": "Charge Tablet",
  "unit": "charges",
  "emissionFactor": 0.00354,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "smart_speaker_daily",
  "activity": "Use Smart Speaker (Daily)",
  "unit": "days",
  "emissionFactor": 0.012744,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "smart_tv_per_hour",
  "activity": "Use Smart TV",
  "unit": "hours",
  "emissionFactor": 0.02124,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "streaming_video_per_hour",
  "activity": "Stream Video Content",
  "unit": "hours",
  "emissionFactor": 0.002655,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "lighting_led_per_hour",
  "activity": "Use LED Lighting",
  "unit": "hours",
  "emissionFactor": 0.001593,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "lighting_incandescent_per_hour",
  "activity": "Use Incandescent Lighting",
  "unit": "hours",
  "emissionFactor": 0.01062,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "printer_use",
  "activity": "Use Home Printer",
  "unit": "uses",
  "emissionFactor": 0.00885,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "fan_per_hour",
  "activity": "Use Electric Fan",
  "unit": "hours",
  "emissionFactor": 0.00885,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "robot_vacuum_per_use",
  "activity": "Use Robot Vacuum",
  "unit": "uses",
  "emissionFactor": 0.0531,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "dish_handwash_hot_per_min",
  "activity": "Handwash Dishes with Hot Water",
  "unit": "minutes",
  "emissionFactor": 0.20251,
  "source": "Estimated using DEFRA 2025 water and electricity factors",
  "category": "general"
},
  {
  "id": "shower_cold_per_min",
  "activity": "Take a Cold Shower",
  "unit": "minutes",
  "emissionFactor": 1.087618,
  "source": "Estimated using DEFRA 2025 water factor",
  "category": "general"
},
  {
  "id": "bidet_use",
  "activity": "Use Smart Toilet/Bidet",
  "unit": "uses",
  "emissionFactor": 0.00531,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
  {
  "id": "humidifier_per_hour",
  "activity": "Run Humidifier/Dehumidifier",
  "unit": "hours",
  "emissionFactor": 0.0354,
  "source": "Estimated using DEFRA 2025 electricity factor",
  "category": "general"
},
];

export default generalActivities;
