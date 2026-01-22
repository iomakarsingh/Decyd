// User Tracker - Tracks user interactions and builds preference profile

class UserTracker {
    constructor(userId = null) {
        this.userId = userId;
        this.storageKey = userId ? `decyd_user_data_${userId}` : 'decyd_user_data';
        this.userData = this.loadUserData();
    }

    /**
     * Set user ID (for switching users)
     */
    setUserId(userId) {
        this.userId = userId;
        this.storageKey = `decyd_user_data_${userId}`;
        this.userData = this.loadUserData();
    }

    /**
     * Load user data from localStorage
     */
    loadUserData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error loading user data:', e);
            }
        }

        // Initialize new user data
        return {
            interactions: [],
            preferences: {},
            firstVisit: new Date().toISOString(),
            lastVisit: new Date().toISOString()
        };
    }

    /**
     * Save user data to localStorage
     */
    saveUserData() {
        try {
            this.userData.lastVisit = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.userData));
        } catch (e) {
            console.error('Error saving user data:', e);
        }
    }

    /**
     * Track when user views a food suggestion
     */
    trackView(foodId, context) {
        this.addInteraction({
            type: 'view',
            foodId,
            context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track when user clicks "Order This"
     */
    trackOrder(foodId, context) {
        this.addInteraction({
            type: 'order',
            foodId,
            context,
            timestamp: new Date().toISOString()
        });

        // Increase preference score for this food
        this.updatePreference(foodId, 3);
    }

    /**
     * Track when user clicks "Make This"
     */
    trackMake(foodId, context) {
        this.addInteraction({
            type: 'make',
            foodId,
            context,
            timestamp: new Date().toISOString()
        });

        // Increase preference score for this food
        this.updatePreference(foodId, 2);
    }

    /**
     * Track when user skips to backup suggestion
     */
    trackSkip(foodId, context) {
        this.addInteraction({
            type: 'skip',
            foodId,
            context,
            timestamp: new Date().toISOString()
        });

        // Decrease preference score for this food
        this.updatePreference(foodId, -1);
    }

    /**
     * Add interaction to history
     */
    addInteraction(interaction) {
        this.userData.interactions.push(interaction);

        // Keep only last 100 interactions to prevent storage bloat
        if (this.userData.interactions.length > 100) {
            this.userData.interactions = this.userData.interactions.slice(-100);
        }

        this.saveUserData();
    }

    /**
     * Update preference score for a food item
     */
    updatePreference(foodId, delta) {
        if (!this.userData.preferences[foodId]) {
            this.userData.preferences[foodId] = 0;
        }

        this.userData.preferences[foodId] += delta;

        // Cap preferences between -10 and 10
        this.userData.preferences[foodId] = Math.max(-10, Math.min(10, this.userData.preferences[foodId]));

        this.saveUserData();
    }

    /**
     * Get preference score for a food item
     */
    getPreferenceScore(foodId) {
        return this.userData.preferences[foodId] || 0;
    }

    /**
     * Get interaction history for a specific food
     */
    getFoodHistory(foodId) {
        return this.userData.interactions.filter(i => i.foodId === foodId);
    }

    /**
     * Get recent interactions
     */
    getRecentInteractions(limit = 10) {
        return this.userData.interactions.slice(-limit).reverse();
    }

    /**
     * Check if this is user's first visit
     */
    isFirstVisit() {
        return this.userData.interactions.length === 0;
    }

    /**
     * Get user statistics
     */
    getStats() {
        const stats = {
            totalInteractions: this.userData.interactions.length,
            orders: this.userData.interactions.filter(i => i.type === 'order').length,
            makes: this.userData.interactions.filter(i => i.type === 'make').length,
            skips: this.userData.interactions.filter(i => i.type === 'skip').length,
            favoriteFood: null
        };

        // Find favorite food (highest preference score)
        let maxScore = -Infinity;
        for (const [foodId, score] of Object.entries(this.userData.preferences)) {
            if (score > maxScore) {
                maxScore = score;
                stats.favoriteFood = foodId;
            }
        }

        return stats;
    }
}

// Export for use in other modules
window.UserTracker = UserTracker;
