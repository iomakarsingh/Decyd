// Recommendation Engine - Scores and selects food suggestions based on context and user preferences

class RecommendationEngine {
    constructor(userTracker) {
        this.userTracker = userTracker;
        this.foods = [];
        this.currentRecommendations = {
            primary: null,
            backup: null
        };
    }

    /**
     * Load food database
     */
    async loadFoods() {
        try {
            const response = await fetch('data/foods.json');
            this.foods = await response.json();
            return this.foods;
        } catch (error) {
            console.error('Error loading foods:', error);
            return [];
        }
    }

    /**
     * Get recommendations based on current context
     */
    async getRecommendations(context, userCountry = null) {
        if (this.foods.length === 0) {
            await this.loadFoods();
        }

        // Score all foods based on context and user preferences
        const scoredFoods = this.foods.map(food => ({
            ...food,
            score: this.calculateScore(food, context, userCountry)
        }));

        // Sort by score (highest first)
        scoredFoods.sort((a, b) => b.score - a.score);

        // Select primary and backup
        this.currentRecommendations.primary = scoredFoods[0];
        this.currentRecommendations.backup = scoredFoods[1];

        return this.currentRecommendations;
    }

    /**
     * Calculate recommendation score for a food item
     */
    calculateScore(food, context, userCountry = null) {
        let score = 0;

        // 1. Time/Meal Type Score (40% weight)
        const mealScore = food.timeScore[context.mealType] || 0;
        score += mealScore * 4;

        // 2. Weather Score (30% weight)
        const weatherScore = food.weatherScore[context.weather] || 5;
        score += weatherScore * 3;

        // 3. Day Type Score (20% weight)
        const dayScore = food.dayScore[context.dayType] || 5;
        score += dayScore * 2;

        // 4. User Preference Score (10% weight)
        const preferenceScore = this.userTracker.getPreferenceScore(food.id);
        score += preferenceScore * 1;

        // 5. Country/Cuisine Preference Boost (15% weight)
        if (userCountry && food.cuisine) {
            const cuisineBoost = this.getCuisineBoost(food.cuisine, userCountry);
            score += cuisineBoost * 1.5;
        }

        // 6. Recency penalty - avoid showing same food too often
        const recentViews = this.userTracker.getFoodHistory(food.id)
            .filter(i => i.type === 'view' || i.type === 'order' || i.type === 'make');

        if (recentViews.length > 0) {
            const lastView = new Date(recentViews[recentViews.length - 1].timestamp);
            const hoursSinceLastView = (Date.now() - lastView.getTime()) / (1000 * 60 * 60);

            // Apply penalty if viewed in last 24 hours
            if (hoursSinceLastView < 24) {
                score -= (24 - hoursSinceLastView) * 2;
            }
        }

        return score;
    }

    /**
     * Get cuisine boost based on user's country
     */
    getCuisineBoost(cuisine, country) {
        // Map countries to their local cuisines
        const countryToCuisine = {
            'India': ['Indian'],
            'USA': ['American'],
            'Italy': ['Italian'],
            'Mexico': ['Mexican'],
            'Japan': ['Japanese'],
            'China': ['Chinese'],
            'Thailand': ['Thai'],
            'France': ['French'],
            'Greece': ['Mediterranean'],
            'UK': ['American'], // Similar tastes
            'Spain': ['Mediterranean'],
            'Other': [] // No specific boost
        };

        const localCuisines = countryToCuisine[country] || [];

        // Give strong boost to local cuisine
        if (localCuisines.includes(cuisine)) {
            return 10; // Strong boost for local cuisine
        }

        // Give small boost to similar cuisines
        if (country === 'India' && cuisine === 'Thai') return 3;
        if (country === 'USA' && cuisine === 'Mexican') return 3;
        if (country === 'Italy' && cuisine === 'French') return 3;
        if (country === 'Japan' && cuisine === 'Chinese') return 3;

        return 0; // No boost
    }

    /**
     * Get contextual reason for recommendation
     */
    getReason(food, context) {
        // Check if food has specific reasons for current context
        const { weather, timeOfDay, dayType } = context;

        // Priority: weather-specific reason
        if (food.reason[weather]) {
            return food.reason[weather];
        }

        // Then: time-specific reason
        if (food.reason[timeOfDay]) {
            return food.reason[timeOfDay];
        }

        // Then: day-specific reason
        if (food.reason[dayType]) {
            return food.reason[dayType];
        }

        // Fallback: generic reason based on meal type
        const genericReasons = {
            breakfast: `Perfect way to start your ${dayType === 'weekend' ? 'weekend' : 'day'}`,
            lunch: `Satisfying lunch for a ${weather} ${timeOfDay}`,
            dinner: `Delicious dinner to end your day`,
            snack: `Quick and tasty ${timeOfDay} snack`
        };

        return genericReasons[context.mealType] || food.description;
    }

    /**
     * Get current recommendations
     */
    getCurrentRecommendations() {
        return this.currentRecommendations;
    }

    /**
     * Swap primary and backup recommendations
     */
    swapToPrimary() {
        const temp = this.currentRecommendations.primary;
        this.currentRecommendations.primary = this.currentRecommendations.backup;
        this.currentRecommendations.backup = temp;
    }
}

// Export for use in other modules
window.RecommendationEngine = RecommendationEngine;
