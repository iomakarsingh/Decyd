const fs = require('fs');

/**
 * Pexels Image Updater
 * Updates all food images with high-quality Pexels images
 * 
 * Setup:
 * 1. Get free API key from: https://www.pexels.com/api/
 * 2. Replace YOUR_API_KEY_HERE below
 * 3. Run: node update_images_pexels.js
 */

const PEXELS_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your API key

// Mapping of dish IDs to search terms for better image results
const dishToSearchTerm = {
    'butter-chicken': 'butter chicken indian curry',
    'pizza': 'pizza margherita italian',
    'paneer-tikka': 'paneer tikka indian appetizer',
    'biryani': 'biryani rice indian',
    'pasta': 'pasta carbonara italian',
    'tacos': 'mexican tacos street food',
    'sushi': 'sushi rolls japanese',
    'burger': 'gourmet burger american',
    'ramen': 'ramen noodles japanese',
    'pad-thai': 'pad thai noodles',
    'dal-makhani': 'dal makhani indian lentils',
    'margherita-pizza': 'margherita pizza',
    'chicken-tikka-masala': 'chicken tikka masala',
    'spaghetti-carbonara': 'spaghetti carbonara',
    'fish-tacos': 'fish tacos mexican',
    'california-roll': 'california sushi roll',
    'cheeseburger': 'cheeseburger american',
    'tonkotsu-ramen': 'tonkotsu ramen japanese',
    'chicken-pad-thai': 'chicken pad thai',
    'chole-bhature': 'chole bhature indian',
    'pepperoni-pizza': 'pepperoni pizza',
    'palak-paneer': 'palak paneer indian spinach',
    'penne-arrabbiata': 'penne arrabbiata pasta',
    'beef-tacos': 'beef tacos mexican',
    'spicy-tuna-roll': 'spicy tuna sushi roll',
    'veggie-burger': 'veggie burger vegetarian',
    'miso-ramen': 'miso ramen japanese',
    'shrimp-pad-thai': 'shrimp pad thai',
    'samosa': 'samosa indian snack',
    'four-cheese-pizza': 'four cheese pizza',
    'malai-kofta': 'malai kofta indian',
    'lasagna': 'lasagna italian',
    'quesadilla': 'quesadilla mexican',
    'dragon-roll': 'dragon sushi roll',
    'pulled-pork-burger': 'pulled pork burger',
    'shoyu-ramen': 'shoyu ramen japanese',
    'vegetable-pad-thai': 'vegetable pad thai',
    'aloo-gobi': 'aloo gobi indian cauliflower',
    'bbq-chicken-pizza': 'bbq chicken pizza',
    'rajma': 'rajma indian kidney beans',
    'fettuccine-alfredo': 'fettuccine alfredo pasta',
    'burrito': 'burrito mexican',
    'rainbow-roll': 'rainbow sushi roll',
    'chicken-burger': 'chicken burger grilled',
    'spicy-miso-ramen': 'spicy miso ramen',
    'drunken-noodles': 'drunken noodles thai',
    'pav-bhaji': 'pav bhaji indian street food',
    'hawaiian-pizza': 'hawaiian pizza pineapple',
    'chicken-curry': 'chicken curry indian',
    'pesto-pasta': 'pesto pasta italian',
    'nachos': 'nachos mexican cheese',
    'salmon-roll': 'salmon sushi roll',
    'bacon-burger': 'bacon burger american',
    'vegetable-ramen': 'vegetable ramen japanese',
    'basil-fried-rice': 'basil fried rice thai',
    'masala-dosa': 'masala dosa indian crepe',
    'veggie-pizza': 'veggie pizza vegetables',
    'rogan-josh': 'rogan josh indian lamb',
    'ravioli': 'ravioli italian pasta',
    'enchiladas': 'enchiladas mexican',
    'eel-roll': 'eel sushi roll',
    'mushroom-burger': 'mushroom burger portobello',
    'seafood-ramen': 'seafood ramen japanese'
};

/**
 * Fetch image from Pexels API
 */
async function fetchPexelsImage(searchTerm) {
    try {
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`,
            {
                headers: {
                    'Authorization': PEXELS_API_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
            // Use large size for better quality
            return data.photos[0].src.large;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching image for "${searchTerm}":`, error.message);
        return null;
    }
}

/**
 * Update all images in foods.json
 */
async function updateAllImages() {
    console.log('🚀 Starting Pexels image update...\n');

    // Check if API key is set
    if (PEXELS_API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('❌ ERROR: Please set your Pexels API key first!');
        console.log('Get a free API key from: https://www.pexels.com/api/\n');
        return;
    }

    // Load foods.json
    const foodsPath = './foods.json';
    let foods;

    try {
        foods = JSON.parse(fs.readFileSync(foodsPath, 'utf8'));
    } catch (error) {
        console.error('❌ Error reading foods.json:', error.message);
        return;
    }

    console.log(`Found ${foods.length} dishes to update\n`);

    let successCount = 0;
    let failCount = 0;

    // Update each food item
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        const searchTerm = dishToSearchTerm[food.id] || food.name;

        console.log(`[${i + 1}/${foods.length}] Fetching image for "${food.name}"...`);

        const imageUrl = await fetchPexelsImage(searchTerm);

        if (imageUrl) {
            food.image = imageUrl;
            successCount++;
            console.log(`✅ Updated: ${imageUrl.substring(0, 60)}...\n`);
        } else {
            failCount++;
            console.log(`❌ No image found, keeping existing URL\n`);
        }

        // Respect API rate limits (200/hour = ~2 per second)
        // Wait 600ms between requests to be safe
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Save updated foods.json
    try {
        fs.writeFileSync(foodsPath, JSON.stringify(foods, null, 2));
        console.log('\n✅ foods.json updated successfully!');
        console.log(`📊 Results: ${successCount} updated, ${failCount} failed`);
    } catch (error) {
        console.error('❌ Error writing foods.json:', error.message);
    }
}

// Run the update
updateAllImages().catch(console.error);
