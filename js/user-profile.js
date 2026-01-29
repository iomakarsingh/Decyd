/**
 * User Profile Management System
 * Handles profile initialization, time-based profiles, and persistence
 */

const UserProfile = {
    VERSION: '2.0',

    /**
     * Initialize profile from signup answers
     * Maps signup questions to weight attributes
     */
    initializeFromSignup(answers) {
        const profile = {
            version: this.VERSION,
            created: Date.now(),
            lastUpdated: Date.now(),

            // Global preferences
            order_bias: 0.5,
            make_bias: 0.5,
            novelty_cap: 'medium',

            // Time-based profiles (initialized with neutral weights)
            profiles: {
                morning: { comfort: 0.5, novelty: 0.3, effort: 0.2, indulgent: 0.3 },
                lunch: { comfort: 0.5, novelty: 0.4, effort: 0.4, indulgent: 0.5 },
                evening: { comfort: 0.6, novelty: 0.3, effort: 0.3, indulgent: 0.6 },
                night: { comfort: 0.7, novelty: 0.2, effort: 0.1, indulgent: 0.7 }
            },

            // Behavioral tracking
            interactions: {
                total: 0,
                lastDecay: Date.now(),
                recentDishes: [] // Last 5 dishes for anti-repetition
            }
        };

        // Apply signup answer mappings to ALL time profiles
        this._applySignupMappings(profile, answers);

        return profile;
    },

    /**
     * Map signup answers to profile weights
     */
    _applySignupMappings(profile, answers) {
        // Q1: When hungry, you mostly want:
        if (answers.q1 === 'familiar') {
            this._adjustAllProfiles(profile, { comfort: 0.4, novelty: -0.2 });
        } else if (answers.q1 === 'exciting') {
            this._adjustAllProfiles(profile, { comfort: -0.2, novelty: 0.4 });
        } else if (answers.q1 === 'quick') {
            this._adjustAllProfiles(profile, { effort: -0.5 }); // Lower effort preference
        }

        // Q2: Comfort food feels:
        if (answers.q2 === 'home-style') {
            this._adjustAllProfiles(profile, { comfort: 0.4 });
        } else if (answers.q2 === 'indulgent') {
            this._adjustAllProfiles(profile, { indulgent: 0.4 });
        } else if (answers.q2 === 'light') {
            this._adjustAllProfiles(profile, { indulgent: -0.4 });
        }

        // Q3: Prefer:
        if (answers.q3 === 'order') {
            profile.order_bias = 0.8;
            profile.make_bias = 0.2;
        } else if (answers.q3 === 'cook') {
            profile.order_bias = 0.2;
            profile.make_bias = 0.8;
        } else if (answers.q3 === 'mix') {
            profile.order_bias = 0.5;
            profile.make_bias = 0.5;
        }

        // Q4: Adventurous level:
        if (answers.q4 === 'safe') {
            profile.novelty_cap = 'low';
        } else if (answers.q4 === 'sometimes') {
            profile.novelty_cap = 'medium';
        } else if (answers.q4 === 'surprise') {
            profile.novelty_cap = 'high';
        }

        // Clamp all weights to [0, 1]
        this._clampAllWeights(profile);
    },

    /**
     * Adjust weights across all time-based profiles
     */
    _adjustAllProfiles(profile, adjustments) {
        Object.keys(profile.profiles).forEach(timeSlot => {
            Object.keys(adjustments).forEach(attr => {
                if (profile.profiles[timeSlot][attr] !== undefined) {
                    profile.profiles[timeSlot][attr] += adjustments[attr];
                }
            });
        });
    },

    /**
     * Clamp all weights to valid range [0, 1]
     */
    _clampAllWeights(profile) {
        Object.keys(profile.profiles).forEach(timeSlot => {
            Object.keys(profile.profiles[timeSlot]).forEach(attr => {
                profile.profiles[timeSlot][attr] = Math.max(0, Math.min(1, profile.profiles[timeSlot][attr]));
            });
        });
    },

    /**
     * Get current time-appropriate profile
     */
    getCurrentProfile(profile) {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 11) {
            return { ...profile.profiles.morning, timeSlot: 'morning' };
        } else if (hour >= 11 && hour < 16) {
            return { ...profile.profiles.lunch, timeSlot: 'lunch' };
        } else if (hour >= 16 && hour < 22) {
            return { ...profile.profiles.evening, timeSlot: 'evening' };
        } else {
            return { ...profile.profiles.night, timeSlot: 'night' };
        }
    },

    /**
     * Save profile to localStorage
     */
    save(profile) {
        try {
            profile.lastUpdated = Date.now();
            localStorage.setItem('decyd_user_profile', JSON.stringify(profile));
            return true;
        } catch (error) {
            console.error('Failed to save profile:', error);
            return false;
        }
    },

    /**
     * Load profile from localStorage
     */
    load() {
        try {
            const stored = localStorage.getItem('decyd_user_profile');
            if (!stored) return null;

            const profile = JSON.parse(stored);

            // Version check
            if (profile.version !== this.VERSION) {
                console.warn('Profile version mismatch, migration needed');
                return null;
            }

            return profile;
        } catch (error) {
            console.error('Failed to load profile:', error);
            return null;
        }
    },

    /**
     * Check if profile exists
     */
    exists() {
        return localStorage.getItem('decyd_user_profile') !== null;
    },

    /**
     * Delete profile (for testing/reset)
     */
    clear() {
        localStorage.removeItem('decyd_user_profile');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfile;
}
