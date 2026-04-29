from datetime import datetime

CROP_DATA = {
    1:  { "month": "January",   "season": "Rabi",   "crops": [
            {"name": "Wheat",       "emoji": "🌾", "duration": "120-150 days", "water": "Medium", "tip": "Best time to fertilize wheat crop."},
            {"name": "Mustard",     "emoji": "🌻", "duration": "110-140 days", "water": "Low",    "tip": "Check for aphid attack in mustard."},
            {"name": "Peas",        "emoji": "🫛", "duration": "60-90 days",   "water": "Medium", "tip": "Harvest before pods dry out."},
            {"name": "Potato",      "emoji": "🥔", "duration": "70-120 days",  "water": "High",   "tip": "Earthing-up helps increase yield."},
        ]},
    2:  { "month": "February",  "season": "Rabi",   "crops": [
            {"name": "Wheat",       "emoji": "🌾", "duration": "120-150 days", "water": "Medium", "tip": "Last irrigation before grain filling."},
            {"name": "Barley",      "emoji": "🌾", "duration": "90-120 days",  "water": "Low",    "tip": "Good for dry areas."},
            {"name": "Sunflower",   "emoji": "🌻", "duration": "90-120 days",  "water": "Medium", "tip": "Start sowing sunflower seeds."},
        ]},
    3:  { "month": "March",     "season": "Zaid",   "crops": [
            {"name": "Mung Bean",   "emoji": "🫘", "duration": "60-75 days",   "water": "Medium", "tip": "Sow in well-drained soil."},
            {"name": "Watermelon",  "emoji": "🍉", "duration": "80-110 days",  "water": "High",   "tip": "Needs warm weather to grow."},
            {"name": "Cucumber",    "emoji": "🥒", "duration": "50-70 days",   "water": "High",   "tip": "Train vines on trellis."},
            {"name": "Vegetables",  "emoji": "🥬", "duration": "30-60 days",   "water": "Medium", "tip": "Start summer vegetables."},
        ]},
    4:  { "month": "April",     "season": "Zaid",   "crops": [
            {"name": "Mung Bean",   "emoji": "🫘", "duration": "60-75 days",   "water": "Medium", "tip": "Protect from heat stress."},
            {"name": "Bitter Gourd","emoji": "🥒", "duration": "55-75 days",   "water": "Medium", "tip": "Rich in nutrients."},
            {"name": "Okra",        "emoji": "🌿", "duration": "50-65 days",   "water": "Medium", "tip": "Sow seeds directly in field."},
        ]},
    5:  { "month": "May",       "season": "Kharif", "crops": [
            {"name": "Sugarcane",   "emoji": "🎋", "duration": "10-12 months", "water": "High",   "tip": "Early planting gives better yield."},
            {"name": "Maize",       "emoji": "🌽", "duration": "80-110 days",  "water": "Medium", "tip": "Pre-monsoon planting."},
            {"name": "Cotton",      "emoji": "🌿", "duration": "150-180 days", "water": "Medium", "tip": "Choose BT cotton varieties."},
        ]},
    6:  { "month": "June",      "season": "Kharif", "crops": [
            {"name": "Rice",        "emoji": "🌾", "duration": "110-150 days", "water": "High",   "tip": "Transplant seedlings after monsoon onset."},
            {"name": "Maize",       "emoji": "🌽", "duration": "80-110 days",  "water": "Medium", "tip": "Sow with first monsoon rain."},
            {"name": "Soybean",     "emoji": "🫘", "duration": "90-120 days",  "water": "Medium", "tip": "Needs warm & moist conditions."},
            {"name": "Groundnut",   "emoji": "🥜", "duration": "100-130 days", "water": "Medium", "tip": "Kharif groundnut season starts."},
        ]},
    7:  { "month": "July",      "season": "Kharif", "crops": [
            {"name": "Rice",        "emoji": "🌾", "duration": "110-150 days", "water": "High",   "tip": "Maintain water level in paddy fields."},
            {"name": "Soybean",     "emoji": "🫘", "duration": "90-120 days",  "water": "Medium", "tip": "Apply phosphate fertilizer."},
            {"name": "Pigeon Pea",  "emoji": "🫛", "duration": "120-180 days", "water": "Low",    "tip": "Drought-tolerant crop."},
        ]},
    8:  { "month": "August",    "season": "Kharif", "crops": [
            {"name": "Rice",        "emoji": "🌾", "duration": "110-150 days", "water": "High",   "tip": "Watch for blast disease."},
            {"name": "Groundnut",   "emoji": "🥜", "duration": "100-130 days", "water": "Medium", "tip": "Pod development stage."},
            {"name": "Turmeric",    "emoji": "🌿", "duration": "210-270 days", "water": "High",   "tip": "Mulching helps retain moisture."},
        ]},
    9:  { "month": "September", "season": "Rabi",   "crops": [
            {"name": "Maize",       "emoji": "🌽", "duration": "80-110 days",  "water": "Medium", "tip": "Late kharif maize harvest time."},
            {"name": "Carrot",      "emoji": "🥕", "duration": "70-80 days",   "water": "Medium", "tip": "Start rabi vegetable sowing."},
            {"name": "Spinach",     "emoji": "🥬", "duration": "40-50 days",   "water": "Medium", "tip": "Cool weather crop begins."},
        ]},
    10: { "month": "October",   "season": "Rabi",   "crops": [
            {"name": "Wheat",       "emoji": "🌾", "duration": "120-150 days", "water": "Medium", "tip": "Prepare fields for wheat sowing."},
            {"name": "Chickpea",    "emoji": "🫘", "duration": "90-120 days",  "water": "Low",    "tip": "Sow in well-drained loamy soil."},
            {"name": "Lentil",      "emoji": "🫘", "duration": "80-110 days",  "water": "Low",    "tip": "Good for dryland farming."},
            {"name": "Mustard",     "emoji": "🌻", "duration": "110-140 days", "water": "Low",    "tip": "Best sowing time for mustard."},
        ]},
    11: { "month": "November",  "season": "Rabi",   "crops": [
            {"name": "Wheat",       "emoji": "🌾", "duration": "120-150 days", "water": "Medium", "tip": "Timely sowing for best yield."},
            {"name": "Peas",        "emoji": "🫛", "duration": "60-90 days",   "water": "Medium", "tip": "Cool season legume."},
            {"name": "Onion",       "emoji": "🧅", "duration": "100-120 days", "water": "Medium", "tip": "Transplant onion seedlings."},
        ]},
    12: { "month": "December",  "season": "Rabi",   "crops": [
            {"name": "Wheat",       "emoji": "🌾", "duration": "120-150 days", "water": "Medium", "tip": "First irrigation 21 days after sowing."},
            {"name": "Potato",      "emoji": "🥔", "duration": "70-120 days",  "water": "High",   "tip": "Late planting of potato."},
            {"name": "Cauliflower", "emoji": "🥦", "duration": "60-90 days",   "water": "Medium", "tip": "Winter cauliflower harvest."},
            {"name": "Tomato",      "emoji": "🍅", "duration": "70-90 days",   "water": "Medium", "tip": "Protect from frost."},
        ]},
}

def get_crops_for_month(month=None):
    if month is None:
        month = datetime.now().month
    month = int(month)
    if month not in CROP_DATA:
        raise ValueError(f"Invalid month: {month}")
    return CROP_DATA[month]

def get_all_crops():
    return CROP_DATA
