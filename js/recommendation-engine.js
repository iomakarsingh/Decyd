/**
 * Enhanced Recommendation Engine with Adaptive Learning
 * Scores dishes based on user profile, context, and behavioral patterns
 */

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
     * Get recommendations based on current context and user profile
     */
    async getRecommendations(context, userCountry = null) {
        if (this.foods.length === 0) {
            await this.loadFoods();
        }

        // Load user profile
        const profile = UserProfile.load();
        if (!profile) {
            console.warn('No user profile found, using default scoring');
            return this._getDefaultRecommendations(context, userCountry);
        }

        // Get current time-appropriate profile
        const currentProfile = UserProfile.getCurrentProfile(profile);

        // Score all foods based on adaptive algorithm
        const scoredFoods = this.foods.map(food => ({
            ...food,
            score: this.calculateAdaptiveScore(food, currentProfile, profile, context, userCountry)
        }));

        // Sort by score (highest first)
        scoredFoods.sort((a, b) => b.score - a.score);

        // Select primary and backup (ensure they're different types)
        this.currentRecommendations.primary = scoredFoods[0];
        this.currentRecommendations.backup = this._selectBackup(scoredFoods, scoredFoods[0]);

        return this.currentRecommendations;
    }

    /**
     * Calculate adaptive score based on user profile and context
     * Priority: Time > Weather > Behavior > Profile Weights
     */
    calculateAdaptiveScore(dish, currentProfile, fullProfile, context, userCountry) {
        let score = 0;
        const attrs = dish.attributes;

        // 1. USER PROFILE WEIGHTS (Base score)
        score += this._scoreProfileWeights(attrs, currentProfile);

        // 2. CONTEXT MULTIPLIERS (HIGHEST PRIORITY)
        score *= this._getContextMultiplier(attrs, context);

        // 3. NOVELTY CAP (Prevent overwhelming adventurous dishes)
        score *= this._getNoveltyCapMultiplier(attrs.novelty_level, fullProfile.novelty_cap);

        // 4. ANTI-REPETITION PENALTY
        score *= this._getRepetitionPenalty(dish, fullProfile.interactions.recentDishes);

        // 5. RECENCY BONUS (Reward dishes not seen recently)
        score *= this._getRecencyBonus(dish, fullProfile.interactions.recentDishes);

        // 6. COUNTRY/CUISINE PREFERENCE (if available)
        if (userCountry) {
            score *= this._getCuisineMultiplier(dish.cuisine, userCountry);
        }

        return score;
    }

    /**
     * Score based on user profile weights
     */
    _scoreProfileWeights(attrs, profile) {
        let score = 0;

        // Map attribute values to numeric scores
        const comfortMap = { low: 0.2, medium: 0.5, high: 0.8 };
        const noveltyMap = { safe: 0.2, moderate: 0.5, adventurous: 0.8 };
        const effortMap = { quick: 0.8, medium: 0.5, heavy: 0.2 }; // Lower effort = higher score
        const healthMap = { light: 0.2, normal: 0.5, indulgent: 0.8 };

        // Apply profile weights to dish attributes
        if (attrs.comfort_level) {
            score += profile.comfort * comfortMap[attrs.comfort_level] * 10;
        }
        if (attrs.novelty_level) {
            score += profile.novelty * noveltyMap[attrs.novelty_level] * 10;
        }
        if (attrs.effort) {
            score += (1 - profile.effort) * effortMap[attrs.effort] * 10;
        }
        if (attrs.health_weight) {
            score += profile.indulgent * healthMap[attrs.health_weight] * 10;
        }

        return score;
    }

    /**
     * Get context multiplier (Time and Weather)
     */
    _getContextMultiplier(attrs, context) {
        let multiplier = 1.0;

        // TIME CONTEXT (1.5x if matches)
        const currentTime = this._getCurrentTimeCategory();
        if (attrs.time_fit && attrs.time_fit.includes(currentTime)) {
            multiplier *= 1.5;
        }

        // WEATHER CONTEXT (1.3x if matches)
        if (context.weather && attrs.weather_fit) {
            const weatherMatch = this._matchWeather(context.weather, attrs.weather_fit);
            if (weatherMatch) {
                multiplier *= 1.3;
            }
        }

        return multiplier;
    }

    /**
     * Get current time category
     */
    _getCurrentTimeCategory() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'breakfast';
        if (hour >= 11 && hour < 16) return 'lunch';
        if (hour >= 16 && hour < 22) return 'dinner';
        return 'late-night';
    }

    /**
     * Match weather to dish weather_fit
     */
    _matchWeather(currentWeather, dishWeatherFit) {
        const weatherMap = {
            'rainy': 'rainy',
            'cold': 'cold',
            'hot': 'hot',
            'pleasant': 'neutral',
            'cloudy': 'neutral'
        };

        const mappedWeather = weatherMap[currentWeather] || 'neutral';
        return dishWeatherFit.includes(mappedWeather);
    }

    /**
     * Apply novelty cap multiplier
     */
    _getNoveltyCapMultiplier(dishNovelty, userCap) {
        const capMap = {
            'low': { safe: 1.0, moderate: 0.5, adventurous: 0.3 },
            'medium': { safe: 1.0, moderate: 1.0, adventurous: 0.6 },
            'high': { safe: 1.0, moderate: 1.0, adventurous: 1.0 }
        };

        return capMap[userCap]?.[dishNovelty] || 1.0;
    }

    /**
     * Get repetition penalty
     */
    _getRepetitionPenalty(dish, recentDishes) {
        const recentIds = recentDishes.map(d => d.id);

        // Heavy penalty if in last 5 dishes
        if (recentIds.includes(dish.id)) {
            return 0.3;
        }

        // Medium penalty if same type in last 3
        const recentTypes = recentDishes.slice(-3).map(d => d.type);
        const currentType = dish.attributes.comfort_level + '_' + dish.attributes.novelty_level;

        if (recentTypes.includes(currentType)) {
            return 0.6;
        }

        return 1.0;
    }

    /**
     * Get recency bonus (reward dishes not seen in a while)
     */
    _getRecencyBonus(dish, recentDishes) {
        const last10 = recentDishes.slice(-10);
        const seenRecently = last10.some(d => d.id === dish.id);

        return seenRecently ? 1.0 : 1.2;
    }

    /**
     * Get cuisine multiplier based on user country
     */
    _getCuisineMultiplier(dishCuisine, userCountry) {
        // Boost local cuisine
        const countryMap = {
            'India': 'Indian',
            'Italy': 'Italian',
            'China': 'Chinese',
            'USA': 'American'
        };

        const localCuisine = countryMap[userCountry];
        return dishCuisine === localCuisine ? 1.2 : 1.0;
    }

    /**
     * Select backup that's different from primary
     */
    _selectBackup(scoredFoods, primary) {
        const primaryType = primary.attributes.comfort_level + '_' + primary.attributes.novelty_level;

        for (let i = 1; i < scoredFoods.length; i++) {
            const candidate = scoredFoods[i];
            const candidateType = candidate.attributes.comfort_level + '_' + candidate.attributes.novelty_level;

            // Select first dish that's a different type
            if (candidateType !== primaryType) {
                return candidate;
            }
        }

        // Fallback to second highest if all same type
        return scoredFoods[1];
    }

    /**
     * Fallback to default recommendations if no profile
     */
    _getDefaultRecommendations(context, userCountry) {
        const scoredFoods = this.foods.map(food => ({
            ...food,
            score: this._calculateBasicScore(food, context, userCountry)
        }));

        scoredFoods.sort((a, b) => b.score - a.score);

        this.currentRecommendations.primary = scoredFoods[0];
        this.currentRecommendations.backup = scoredFoods[1];

        return this.currentRecommendations;
    }

    /**
     * Basic scoring without user profile
     */
    _calculateBasicScore(food, context, userCountry) {
        let score = 0;

        // Time-based scoring
        const timeOfDay = context.timeOfDay || 'lunch';
        score += food.timeScore?.[timeOfDay] || 5;

        // Weather-based scoring
        const weather = context.weather || 'pleasant';
        score += food.weatherScore?.[weather] || 5;

        // Day-based scoring
        const dayType = context.dayType || 'weekday';
        score += food.dayScore?.[dayType] || 5;

        // Country preference
        if (userCountry === 'India' && food.cuisine === 'Indian') {
            score += 3;
        }

        return score;
    }

    /**
     * Get current recommendations (without recalculating)
     */
    getCurrentRecommendations() {
        return this.currentRecommendations;
    }

    /**
     * Swap backup to primary position (called when user clicks backup)
     * Bug #2 fix: this method was missing entirely
     */
    swapToPrimary() {
        if (!this.currentRecommendations.backup) return;

        // Old backup becomes the new primary
        const newPrimary = this.currentRecommendations.backup;

        // Find next best candidate for backup (skip current primary and new primary)
        const usedIds = new Set([
            this.currentRecommendations.primary?.id,
            newPrimary.id
        ]);

        // Score foods again to find next backup
        const newBackup = this.foods.find(f => !usedIds.has(f.id)) || null;

        this.currentRecommendations.primary = newPrimary;
        this.currentRecommendations.backup = newBackup;
    }

    /**
     * Alias for backward compatibility
     */
    getReason(food, context) {
        return this.getRecommendationReason(food, context);
    }

    /**
     * Get reason for recommendation
     */
    getRecommendationReason(food, context) {
        const timeOfDay = context.timeOfDay || 'lunch';
        const weather = context.weather || 'pleasant';
        const dayType = context.dayType || 'weekday';

        // Priority: time > weather > day
        if (food.reason?.[timeOfDay]) {
            return food.reason[timeOfDay];
        }
        if (food.reason?.[weather]) {
            return food.reason[weather];
        }
        if (food.reason?.[dayType]) {
            return food.reason[dayType];
        }

        return food.description || 'A delicious choice for you';
    }

    /**
     * Refresh recommendations
     */
    async refresh(context, userCountry) {
        return await this.getRecommendations(context, userCountry);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecommendationEngine;
}
