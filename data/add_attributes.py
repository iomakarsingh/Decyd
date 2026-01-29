#!/usr/bin/env python3
"""
Add behavioral attributes to all dishes in foods.json
Maps existing dish characteristics to the new attribute system
"""

import json
import sys

def determine_attributes(dish):
    """
    Intelligently determine attributes based on dish characteristics
    """
    dish_id = dish.get('id', '')
    name = dish.get('name', '')
    cuisine = dish.get('cuisine', '')
    time_scores = dish.get('timeScore', {})
    weather_scores = dish.get('weatherScore', {})
    
    # Determine comfort_level based on cuisine and familiarity
    comfort_cuisines = ['Indian', 'Italian', 'Chinese', 'American']
    if cuisine in comfort_cuisines:
        comfort_level = 'high'
    elif 'fusion' in name.lower() or 'modern' in name.lower():
        comfort_level = 'medium'
    else:
        comfort_level = 'medium'
    
    # Determine novelty_level
    exotic_keywords = ['fusion', 'exotic', 'thai', 'korean', 'japanese', 'vietnamese', 'mediterranean']
    safe_keywords = ['chicken', 'rice', 'bread', 'dal', 'roti', 'paratha']
    
    name_lower = name.lower()
    if any(keyword in name_lower for keyword in exotic_keywords):
        novelty_level = 'adventurous'
    elif any(keyword in name_lower for keyword in safe_keywords):
        novelty_level = 'safe'
    else:
        novelty_level = 'moderate'
    
    # Determine effort based on dish complexity
    quick_dishes = ['sandwich', 'salad', 'toast', 'paratha', 'dosa', 'idli', 'poha']
    heavy_dishes = ['biryani', 'curry', 'korma', 'masala', 'tikka']
    
    if any(keyword in name_lower for keyword in quick_dishes):
        effort = 'quick'
    elif any(keyword in name_lower for keyword in heavy_dishes):
        effort = 'heavy'
    else:
        effort = 'medium'
    
    # Determine health_weight
    indulgent_keywords = ['butter', 'cream', 'fried', 'cheese', 'paneer', 'biryani']
    light_keywords = ['salad', 'soup', 'grilled', 'steamed', 'dal', 'vegetable']
    
    if any(keyword in name_lower for keyword in indulgent_keywords):
        health_weight = 'indulgent'
    elif any(keyword in name_lower for keyword in light_keywords):
        health_weight = 'light'
    else:
        health_weight = 'normal'
    
    # Determine time_fit based on timeScore
    time_fit = []
    if time_scores.get('breakfast', 0) >= 7:
        time_fit.append('breakfast')
    if time_scores.get('lunch', 0) >= 7:
        time_fit.append('lunch')
    if time_scores.get('dinner', 0) >= 7:
        time_fit.append('dinner')
    if time_scores.get('snack', 0) >= 7:
        time_fit.append('late-night')
    
    # Default to lunch/dinner if no strong preference
    if not time_fit:
        time_fit = ['lunch', 'dinner']
    
    # Determine weather_fit based on weatherScore
    weather_fit = []
    if weather_scores.get('cold', 0) >= 7:
        weather_fit.append('cold')
    if weather_scores.get('rainy', 0) >= 7:
        weather_fit.append('rainy')
    if weather_scores.get('hot', 0) >= 6:
        weather_fit.append('hot')
    if weather_scores.get('pleasant', 0) >= 6:
        weather_fit.append('neutral')
    
    # Default to neutral if no strong preference
    if not weather_fit:
        weather_fit = ['neutral']
    
    return {
        'comfort_level': comfort_level,
        'novelty_level': novelty_level,
        'effort': effort,
        'health_weight': health_weight,
        'time_fit': time_fit,
        'weather_fit': weather_fit
    }

def main():
    input_file = 'data/foods.json'
    output_file = 'data/foods.json'
    
    # Read existing data
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            dishes = json.load(f)
    except FileNotFoundError:
        print(f"Error: {input_file} not found")
        sys.exit(1)
    
    # Add attributes to each dish
    updated_count = 0
    for dish in dishes:
        if 'attributes' not in dish:
            dish['attributes'] = determine_attributes(dish)
            updated_count += 1
    
    # Write back to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(dishes, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully added attributes to {updated_count} dishes")
    print(f"📊 Total dishes: {len(dishes)}")

if __name__ == '__main__':
    main()
