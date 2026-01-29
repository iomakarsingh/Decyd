/**
 * Learning Engine
 * Tracks user interactions and adapts profile weights over time
 */

const LearningEngine = {
    /**
     * Track user interaction and update profile
     * @param {string} action - 'primary_click', 'backup_click', 'ignore', 'order', 'make'
     * @param {object} dish - The dish object
     * @param {string} timeOfDay - 'morning', 'lunch', 'evening', 'night'
     */
    trackInteraction(action, dish, timeOfDay) {
        const profile = UserProfile.load();
        if (!profile) {
            console.warn('No profile found, cannot track interaction');
            return;
        }

        // Get the appropriate time-based profile
        const timeProfile = profile.profiles[timeOfDay];
        if (!timeProfile) {
            console.error(`Invalid time of day: ${timeOfDay}`);
            return;
        }

        // Update interaction count
        profile.interactions.total++;

        // Track recent dishes for anti-repetition
        this._trackRecentDish(profile, dish);

        // Apply weight updates based on action
        switch (action) {
            case 'primary_click':
                this._updateWeightsOnSelection(timeProfile, dish, 1.0);
                break;
            case 'backup_click':
                this._updateWeightsOnBackup(timeProfile, dish);
                break;
            case 'ignore':
                this._updateWeightsOnIgnore(timeProfile, dish);
                break;
            case 'order':
                profile.order_bias = Math.min(1, profile.order_bias + 0.05);
                profile.make_bias = Math.max(0, profile.make_bias - 0.05);
                break;
            case 'make':
                profile.make_bias = Math.min(1, profile.make_bias + 0.05);
                profile.order_bias = Math.max(0, profile.order_bias - 0.05);
                break;
        }

        // Check for repetition and apply novelty boost if needed
        this._checkRepetition(profile, timeProfile, dish);

        // Save updated profile
        UserProfile.save(profile);

        console.log(`📊 Tracked ${action} for ${dish.name} at ${timeOfDay}`);
    },

    /**
     * Update weights when user selects a dish
     */
    _updateWeightsOnSelection(timeProfile, dish, multiplier = 1.0) {
        const attrs = dish.attributes;

        // Map attribute values to numeric weights
        const comfortMap = { low: 0.2, medium: 0.5, high: 0.8 };
        const noveltyMap = { safe: 0.2, moderate: 0.5, adventurous: 0.8 };
        const effortMap = { quick: 0.2, medium: 0.5, heavy: 0.8 };
        const healthMap = { light: 0.2, normal: 0.5, indulgent: 0.8 };

        // Increase weights for selected dish attributes
        if (attrs.comfort_level) {
            timeProfile.comfort += 0.05 * multiplier * comfortMap[attrs.comfort_level];
        }
        if (attrs.novelty_level) {
            timeProfile.novelty += 0.04 * multiplier * noveltyMap[attrs.novelty_level];
        }
        if (attrs.effort) {
            // Lower effort dishes increase preference for low effort
            const effortAdjust = attrs.effort === 'quick' ? -0.03 : (attrs.effort === 'heavy' ? 0.03 : 0);
            timeProfile.effort += effortAdjust * multiplier;
        }
        if (attrs.health_weight) {
            timeProfile.indulgent += 0.04 * multiplier * healthMap[attrs.health_weight];
        }

        // Clamp to [0, 1]
        this._clampWeights(timeProfile);
    },

    /**
     * Update weights when user chooses backup option
     * This means primary was close but not perfect
     */
    _updateWeightsOnBackup(timeProfile, backupDish) {
        // Smaller weight increase for backup
        this._updateWeightsOnSelection(timeProfile, backupDish, 0.5);

        // Slightly reduce dominant attributes (we got it wrong)
        const maxAttr = this._findDominantAttribute(timeProfile);
        if (maxAttr) {
            timeProfile[maxAttr] = Math.max(0, timeProfile[maxAttr] - 0.03);
        }
    },

    /**
     * Update weights when user ignores suggestion
     */
    _updateWeightsOnIgnore(timeProfile, dish) {
        const attrs = dish.attributes;

        const comfortMap = { low: 0.2, medium: 0.5, high: 0.8 };
        const noveltyMap = { safe: 0.2, moderate: 0.5, adventurous: 0.8 };

        // Small penalties
        if (attrs.comfort_level) {
            timeProfile.comfort -= 0.02 * comfortMap[attrs.comfort_level];
        }
        if (attrs.novelty_level) {
            timeProfile.novelty -= 0.01 * noveltyMap[attrs.novelty_level];
        }

        // Clamp to [0, 1]
        this._clampWeights(timeProfile);
    },

    /**
     * Track recent dishes for anti-repetition
     */
    _trackRecentDish(profile, dish) {
        profile.interactions.recentDishes.push({
            id: dish.id,
            name: dish.name,
            type: dish.attributes.comfort_level + '_' + dish.attributes.novelty_level,
            timestamp: Date.now()
        });

        // Keep only last 5
        if (profile.interactions.recentDishes.length > 5) {
            profile.interactions.recentDishes.shift();
        }
    },

    /**
     * Check for repetition and apply novelty boost
     */
    _checkRepetition(profile, timeProfile, currentDish) {
        const recent = profile.interactions.recentDishes;
        if (recent.length < 3) return;

        // Check if same dish type appeared 3 times in a row
        const currentType = currentDish.attributes.comfort_level + '_' + currentDish.attributes.novelty_level;
        const lastThree = recent.slice(-3);

        const allSameType = lastThree.every(d => d.type === currentType);

        if (allSameType) {
            console.log('🔄 Repetition detected! Boosting novelty...');
            timeProfile.novelty = Math.min(1, timeProfile.novelty + 0.1);
        }
    },

    /**
     * Find dominant attribute in profile
     */
    _findDominantAttribute(timeProfile) {
        let maxValue = -1;
        let maxAttr = null;

        Object.keys(timeProfile).forEach(attr => {
            if (attr !== 'timeSlot' && timeProfile[attr] > maxValue) {
                maxValue = timeProfile[attr];
                maxAttr = attr;
            }
        });

        return maxAttr;
    },

    /**
     * Clamp all weights to [0, 1]
     */
    _clampWeights(timeProfile) {
        Object.keys(timeProfile).forEach(attr => {
            if (attr !== 'timeSlot' && typeof timeProfile[attr] === 'number') {
                timeProfile[attr] = Math.max(0, Math.min(1, timeProfile[attr]));
            }
        });
    },

    /**
     * Apply weekly memory decay
     * Allows taste evolution over time
     */
    checkAndApplyDecay() {
        const profile = UserProfile.load();
        if (!profile) return;

        const now = Date.now();
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        const timeSinceDecay = now - profile.interactions.lastDecay;

        if (timeSinceDecay >= weekInMs) {
            console.log('🔄 Applying weekly memory decay (0.97x)...');

            // Apply decay to all time profiles
            Object.keys(profile.profiles).forEach(timeSlot => {
                Object.keys(profile.profiles[timeSlot]).forEach(attr => {
                    profile.profiles[timeSlot][attr] *= 0.97;
                });
            });

            // Update last decay timestamp
            profile.interactions.lastDecay = now;

            // Save
            UserProfile.save(profile);

            console.log('✅ Memory decay applied');
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningEngine;
}
