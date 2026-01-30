/**
 * Preference Setup Modal
 * One-time modal for existing users to set up their profile
 */

const PreferenceSetupModal = {
    /**
     * Show preference setup modal
     */
    show() {
        // Create modal HTML
        const modalHTML = `
            <div id="preference-setup-modal" class="preference-modal-overlay">
                <div class="preference-modal">
                    <div class="preference-modal-header">
                        <h2>🎯 Let's Personalize Your Experience</h2>
                        <p>Answer a few quick questions to get better recommendations</p>
                    </div>

                    <form id="preference-setup-form" class="preference-form">
                        <div class="preference-question">
                            <label for="pref-q1">When hungry, you mostly want:</label>
                            <select id="pref-q1" name="q1" required>
                                <option value="">Choose one...</option>
                                <option value="familiar">Something familiar & comforting</option>
                                <option value="exciting">Something new & exciting</option>
                                <option value="quick">Something quick & easy</option>
                            </select>
                        </div>

                        <div class="preference-question">
                            <label for="pref-q2">Comfort food feels:</label>
                            <select id="pref-q2" name="q2" required>
                                <option value="">Choose one...</option>
                                <option value="home-style">Home-style & traditional</option>
                                <option value="indulgent">Rich & indulgent</option>
                                <option value="light">Light & healthy</option>
                            </select>
                        </div>

                        <div class="preference-question">
                            <label for="pref-q3">I prefer to:</label>
                            <select id="pref-q3" name="q3" required>
                                <option value="">Choose one...</option>
                                <option value="order">Order food (delivery/takeout)</option>
                                <option value="cook">Cook at home</option>
                                <option value="mix">Mix of both</option>
                            </select>
                        </div>

                        <div class="preference-question">
                            <label for="pref-q4">How adventurous are you with food?</label>
                            <select id="pref-q4" name="q4" required>
                                <option value="">Choose one...</option>
                                <option value="safe">I stick to what I know</option>
                                <option value="sometimes">I try new things sometimes</option>
                                <option value="surprise">Surprise me! I love adventures</option>
                            </select>
                        </div>

                        <div class="preference-modal-actions">
                            <button type="button" class="btn btn-secondary" id="skip-preferences">
                                Skip for now
                            </button>
                            <button type="submit" class="btn btn-primary">
                                Save Preferences
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Insert modal into DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup event listeners
        this._setupEventListeners();

        // Show modal with animation
        setTimeout(() => {
            document.getElementById('preference-setup-modal').classList.add('active');
        }, 100);
    },

    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        const form = document.getElementById('preference-setup-form');
        const skipBtn = document.getElementById('skip-preferences');

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit();
        });

        // Handle skip
        skipBtn.addEventListener('click', () => {
            this._handleSkip();
        });
    },

    /**
     * Handle form submission
     */
    _handleSubmit() {
        const q1 = document.getElementById('pref-q1').value;
        const q2 = document.getElementById('pref-q2').value;
        const q3 = document.getElementById('pref-q3').value;
        const q4 = document.getElementById('pref-q4').value;

        // Initialize profile from answers
        const profile = UserProfile.initializeFromSignup({
            q1: q1,
            q2: q2,
            q3: q3,
            q4: q4
        });

        UserProfile.save(profile);

        console.log('✅ User profile initialized from preference modal:', profile);

        // Close modal
        this.hide();

        // Reload recommendations with new profile
        if (window.app && window.app.loadRecommendations) {
            window.app.loadRecommendations();
        }
    },

    /**
     * Handle skip - create default profile
     */
    _handleSkip() {
        // Create default profile with neutral weights
        const profile = UserProfile.initializeFromSignup({
            q1: 'familiar',  // Default to familiar
            q2: 'home-style', // Default to home-style
            q3: 'mix',        // Default to mix
            q4: 'sometimes'   // Default to moderate adventurousness
        });

        UserProfile.save(profile);

        console.log('⏭️ User skipped preferences, using defaults:', profile);

        // Close modal
        this.hide();
    },

    /**
     * Hide and remove modal
     */
    hide() {
        const modal = document.getElementById('preference-setup-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    },

    /**
     * Check if user needs to set up preferences
     */
    checkAndShow() {
        // Check if profile exists
        if (!UserProfile.exists()) {
            console.log('📋 No profile found, showing preference setup modal');
            this.show();
            return true;
        }

        // Check if profile needs migration (old version)
        const profile = UserProfile.load();
        if (profile && profile.version !== UserProfile.VERSION) {
            console.log('🔄 Profile needs migration, showing preference setup modal');
            this.show();
            return true;
        }

        return false;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreferenceSetupModal;
}
