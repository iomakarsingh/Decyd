/**
 * Profile Settings Modal
 * Allows users to view profile weights, reset profile, and manage settings
 */

const ProfileSettingsModal = {
    /**
     * Show profile settings modal
     */
    show() {
        const profile = UserProfile.load();
        if (!profile) {
            console.error('No profile found');
            return;
        }

        const currentProfile = UserProfile.getCurrentProfile(profile);
        const timeSlot = this._getCurrentTimeSlot();

        // Create modal HTML
        const modalHTML = `
            <div id="profile-settings-modal" class="profile-modal-overlay">
                <div class="profile-modal">
                    <div class="profile-modal-header">
                        <h2>⚙️ Profile Settings</h2>
                        <button class="modal-close-btn" id="close-profile-settings">×</button>
                    </div>

                    <div class="profile-modal-content">
                        <!-- Current Profile Weights -->
                        <div class="profile-section">
                            <h3>Current Preferences (${this._formatTimeSlot(timeSlot)})</h3>
                            <div class="weight-visualization">
                                ${this._renderWeightBar('Comfort', currentProfile.comfort)}
                                ${this._renderWeightBar('Novelty', currentProfile.novelty)}
                                ${this._renderWeightBar('Effort', currentProfile.effort)}
                                ${this._renderWeightBar('Indulgent', currentProfile.indulgent)}
                            </div>
                        </div>

                        <!-- All Time Profiles -->
                        <div class="profile-section">
                            <h3>All Time Profiles</h3>
                            <div class="time-profiles">
                                ${this._renderTimeProfile('Morning', profile.profiles.morning)}
                                ${this._renderTimeProfile('Lunch', profile.profiles.lunch)}
                                ${this._renderTimeProfile('Evening', profile.profiles.evening)}
                                ${this._renderTimeProfile('Night', profile.profiles.night)}
                            </div>
                        </div>

                        <!-- Profile Stats -->
                        <div class="profile-section">
                            <h3>Profile Stats</h3>
                            <div class="profile-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Total Interactions:</span>
                                    <span class="stat-value">${profile.interactions.total}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Order Bias:</span>
                                    <span class="stat-value">${(profile.order_bias * 100).toFixed(0)}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Make Bias:</span>
                                    <span class="stat-value">${(profile.make_bias * 100).toFixed(0)}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Adventurousness:</span>
                                    <span class="stat-value">${this._formatNoveltyCap(profile.novelty_cap)}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="profile-actions">
                            <button class="btn btn-danger" id="reset-profile-btn">
                                🔄 Reset Profile
                            </button>
                            <button class="btn btn-secondary" id="export-profile-btn">
                                📥 Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup event listeners
        this._setupEventListeners();

        // Show modal with animation
        setTimeout(() => {
            document.getElementById('profile-settings-modal').classList.add('active');
        }, 100);
    },

    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        const closeBtn = document.getElementById('close-profile-settings');
        const resetBtn = document.getElementById('reset-profile-btn');
        const exportBtn = document.getElementById('export-profile-btn');

        closeBtn.addEventListener('click', () => this.hide());
        resetBtn.addEventListener('click', () => this._handleReset());
        exportBtn.addEventListener('click', () => this._handleExport());

        // Close on overlay click
        document.getElementById('profile-settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'profile-settings-modal') {
                this.hide();
            }
        });
    },

    /**
     * Handle profile reset
     */
    _handleReset() {
        if (!confirm('Are you sure you want to reset your profile? This will erase all learned preferences.')) {
            return;
        }

        // Show preference modal to re-initialize
        this.hide();
        PreferenceSetupModal.show();
    },

    /**
     * Handle profile export
     */
    _handleExport() {
        const profile = UserProfile.load();
        const dataStr = JSON.stringify(profile, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `decyd-profile-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);

        alert('Profile exported successfully!');
    },

    /**
     * Render weight bar visualization
     */
    _renderWeightBar(label, value) {
        const percentage = (value * 100).toFixed(0);
        const color = this._getWeightColor(value);

        return `
            <div class="weight-bar-container">
                <div class="weight-label">${label}</div>
                <div class="weight-bar-track">
                    <div class="weight-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                </div>
                <div class="weight-value">${percentage}%</div>
            </div>
        `;
    },

    /**
     * Render time profile summary
     */
    _renderTimeProfile(label, profile) {
        return `
            <div class="time-profile-card">
                <h4>${label}</h4>
                <div class="mini-weights">
                    <div class="mini-weight">C: ${(profile.comfort * 100).toFixed(0)}%</div>
                    <div class="mini-weight">N: ${(profile.novelty * 100).toFixed(0)}%</div>
                    <div class="mini-weight">E: ${(profile.effort * 100).toFixed(0)}%</div>
                    <div class="mini-weight">I: ${(profile.indulgent * 100).toFixed(0)}%</div>
                </div>
            </div>
        `;
    },

    /**
     * Get color for weight value
     */
    _getWeightColor(value) {
        if (value < 0.3) return '#ef4444'; // Red
        if (value < 0.5) return '#f59e0b'; // Orange
        if (value < 0.7) return '#10b981'; // Green
        return '#3b82f6'; // Blue
    },

    /**
     * Format novelty cap
     */
    _formatNoveltyCap(cap) {
        const caps = {
            'low': 'Conservative',
            'medium': 'Moderate',
            'high': 'Adventurous'
        };
        return caps[cap] || cap;
    },

    /**
     * Format time slot
     */
    _formatTimeSlot(slot) {
        return slot.charAt(0).toUpperCase() + slot.slice(1);
    },

    /**
     * Get current time slot
     */
    _getCurrentTimeSlot() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 16) return 'lunch';
        if (hour >= 16 && hour < 22) return 'evening';
        return 'night';
    },

    /**
     * Hide and remove modal
     */
    hide() {
        const modal = document.getElementById('profile-settings-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileSettingsModal;
}
