// Main App Controller - Orchestrates the entire application

class DecydApp {
    constructor() {
        // Check authentication first
        this.authManager = new AuthManager();
        if (!this.authManager.isAuthenticated()) {
            window.location.href = 'auth.html';
            return;
        }

        // Get current user
        this.currentUser = this.authManager.getCurrentUser();

        // Initialize core systems with user ID
        this.contextDetector = new ContextDetector();
        this.userTracker = new UserTracker(this.currentUser.id);
        this.recommendationEngine = new RecommendationEngine(this.userTracker);

        // Initialize components
        this.foodCard = new FoodCard('#primary-card');
        this.ingredientList = new IngredientList('#ingredients-list');
        this.recipeView = new RecipeView();

        // State
        this.currentFood = null;
        this.currentContext = null;
        this.recommendations = null;
        this.userInteracted = false;  // Track if user interacted with food

        // View elements
        this.views = {
            loading: document.getElementById('loading'),
            recommendation: document.getElementById('recommendation-view'),
            order: document.getElementById('order-view'),
            make: document.getElementById('make-view'),
            recipe: document.getElementById('recipe-view')
        };

        // Setup ignore tracking
        this._setupIgnoreTracking();

        // Initialize app
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        // Display user name in header
        this.displayUserInfo();

        // Check if user needs to set up preferences (migration)
        const needsSetup = PreferenceSetupModal.checkAndShow();
        if (needsSetup) {
            // Modal will handle profile creation
            // Continue with default recommendations for now
        }

        // Check and apply weekly memory decay
        LearningEngine.checkAndApplyDecay();

        // Show loading screen
        this.showView('loading');

        // Setup event listeners
        this.setupEventListeners();

        // Get context and recommendations
        await this.loadRecommendations();

        // Show main view after short delay
        setTimeout(() => {
            this.showView('recommendation');
        }, 1500);
    }

    /**
     * Display user information in header
     */
    displayUserInfo() {
        const logo = document.querySelector('.logo h1');
        if (logo && this.currentUser) {
            // Create user info element
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <span class="user-name">${this.currentUser.name}</span>
                <button id="logout-btn" class="logout-btn" title="Logout">
                    <span>Logout</span>
                </button>
            `;

            // Insert after logo
            logo.parentElement.parentElement.appendChild(userInfo);
        }
    }

    /**
     * Load recommendations based on current context
     */
    async loadRecommendations() {
        try {
            // Detect current context
            this.currentContext = await this.contextDetector.detectContext();

            // Update context badge
            const contextBadge = document.getElementById('context-badge');
            contextBadge.textContent = this.contextDetector.getContextBadge();

            // Get recommendations (pass user country for cuisine preference)
            const userCountry = this.currentUser?.country || null;
            this.recommendations = await this.recommendationEngine.getRecommendations(
                this.currentContext,
                userCountry
            );

            // Set current food to primary recommendation
            this.currentFood = this.recommendations.primary;

            // Render food card
            const reason = this.recommendationEngine.getRecommendationReason(this.currentFood, this.currentContext);
            this.foodCard.render(this.currentFood, reason);

            // Track view
            this.userTracker.trackView(this.currentFood.id, this.currentContext);

        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Action buttons
        this.actionButtons = new ActionButtons(
            () => this.handleOrder(),
            () => this.handleMake()
        );

        // Backup suggestion
        this.actionButtons.setupBackupHandler(() => this.handleBackup());

        // Feedback buttons
        document.getElementById('feedback-perfect')?.addEventListener('click', () => {
            this.handleFeedbackPerfect();
        });
        document.getElementById('feedback-not-quite')?.addEventListener('click', () => {
            this.handleFeedbackNotQuite();
        });

        // Back buttons
        document.getElementById('back-from-order').addEventListener('click', () => {
            this.showView('recommendation');
        });

        document.getElementById('back-from-make').addEventListener('click', () => {
            this.showView('recommendation');
        });

        document.getElementById('back-from-recipe').addEventListener('click', () => {
            this.showView('make');
        });

        // Buy ingredients button
        document.getElementById('buy-ingredients-btn').addEventListener('click', () => {
            this.handleBuyIngredients();
        });

        // Show recipe button
        document.getElementById('show-recipe-btn').addEventListener('click', () => {
            this.handleShowRecipe();
        });

        // Shopping modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        document.querySelector('.modal-overlay')?.addEventListener('click', () => {
            this.hideModal();
        });

        // Profile settings button (added dynamically via header)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#profile-settings-btn')) {
                if (typeof ProfileSettingsModal !== 'undefined') {
                    ProfileSettingsModal.show();
                }
            }
            if (e.target.closest('#logout-btn')) {
                this.handleLogout();
            }
        });
    }

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.authManager.logout();
            window.location.href = 'auth.html';
        }
    }

    /**
     * Handle Order button click
     */
    handleOrder() {
        // Mark user as interacted
        this.userInteracted = true;

        // Track order action with user tracker
        this.userTracker.trackOrder(this.currentFood.id, this.currentContext);

        // Track with learning engine for profile adaptation
        const timeOfDay = this._getCurrentTimeSlot();
        LearningEngine.trackInteraction('primary_click', this.currentFood, timeOfDay);
        LearningEngine.trackInteraction('order', this.currentFood, timeOfDay);

        // Update dish name in order view
        document.getElementById('order-dish-name').textContent = this.currentFood.name;

        // Get delivery links
        const links = DeepLinks.getDeliveryLinks(this.currentFood.name);

        // Set up delivery app links
        document.getElementById('swiggy-link').href = links.swiggy;
        document.getElementById('zomato-link').href = links.zomato;

        // Show order view
        this.showView('order');
    }

    /**
     * Handle Make button click
     */
    handleMake() {
        // Mark user as interacted
        this.userInteracted = true;

        // Track make action with user tracker
        this.userTracker.trackMake(this.currentFood.id, this.currentContext);

        // Track with learning engine for profile adaptation
        const timeOfDay = this._getCurrentTimeSlot();
        LearningEngine.trackInteraction('primary_click', this.currentFood, timeOfDay);
        LearningEngine.trackInteraction('make', this.currentFood, timeOfDay);

        // Update dish name in make view
        document.getElementById('make-dish-name').textContent = this.currentFood.name;

        // Render ingredients
        const hasMissing = this.ingredientList.render(this.currentFood.ingredients);

        // Show/hide buy button based on missing ingredients
        const buyBtn = document.getElementById('buy-ingredients-btn');
        if (hasMissing) {
            buyBtn.style.display = 'flex';
        } else {
            buyBtn.style.display = 'none';
        }

        // Show make view
        this.showView('make');
    }

    /**
     * Handle backup suggestion toggle
     */
    handleBackup() {
        // Mark user as interacted (prevents ignore tracking on page leave)
        this.userInteracted = true;

        // Track skip action with user tracker
        this.userTracker.trackSkip(this.currentFood.id, this.currentContext);

        // Track with learning engine (backup selection)
        const timeOfDay = this._getCurrentTimeSlot();
        LearningEngine.trackInteraction('backup_click', this.recommendations.backup, timeOfDay);

        // Swap to backup recommendation
        this.recommendationEngine.swapToPrimary();
        this.recommendations = this.recommendationEngine.getCurrentRecommendations();
        this.currentFood = this.recommendations.primary;

        // Update food card
        const reason = this.recommendationEngine.getRecommendationReason(this.currentFood, this.currentContext);
        this.foodCard.update(this.currentFood, reason);

        // Track new view
        this.userTracker.trackView(this.currentFood.id, this.currentContext);

        // Reset for next interaction
        this.userInteracted = false;
    }

    /**
     * Handle "Perfect!" feedback button
     */
    handleFeedbackPerfect() {
        if (!this.currentFood) return;

        this.userInteracted = true;

        const timeOfDay = this._getCurrentTimeSlot();
        LearningEngine.trackInteraction('primary_click', this.currentFood, timeOfDay);

        // Visual feedback — animate button and show toast
        const btn = document.getElementById('feedback-perfect');
        btn.classList.add('active');
        document.getElementById('feedback-not-quite')?.classList.remove('active');
        this._showToast('✨ Great! We\'ll suggest more like this.');

        console.log('✨ Perfect feedback for:', this.currentFood.name);
    }

    /**
     * Handle "Not quite" feedback button
     */
    handleFeedbackNotQuite() {
        if (!this.currentFood) return;

        this.userInteracted = true;

        const timeOfDay = this._getCurrentTimeSlot();
        LearningEngine.trackInteraction('ignore', this.currentFood, timeOfDay);

        // Visual feedback — animate button, then swap to backup
        const btn = document.getElementById('feedback-not-quite');
        btn.classList.add('active');
        document.getElementById('feedback-perfect')?.classList.remove('active');
        this._showToast('🤔 Got it! Trying something different...');

        // Auto-swap to backup after brief delay
        setTimeout(() => {
            if (this.recommendations?.backup) {
                this.recommendationEngine.swapToPrimary();
                this.recommendations = this.recommendationEngine.getCurrentRecommendations();
                this.currentFood = this.recommendations.primary;
                const reason = this.recommendationEngine.getRecommendationReason(this.currentFood, this.currentContext);
                this.foodCard.update(this.currentFood, reason);
                this.userTracker.trackView(this.currentFood.id, this.currentContext);
                // Reset button states on new card
                document.getElementById('feedback-perfect')?.classList.remove('active');
                document.getElementById('feedback-not-quite')?.classList.remove('active');
                this.userInteracted = false;
            }
        }, 800);

        console.log('🤔 Not quite feedback for:', this.currentFood.name);
    }

    /**
     * Show a brief toast notification
     */
    _showToast(message) {
        // Remove existing toast if any
        document.getElementById('decyd-toast')?.remove();

        const toast = document.createElement('div');
        toast.id = 'decyd-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #1a1a1a;
            color: white;
            padding: 12px 24px;
            border-radius: 999px;
            font-family: var(--font-display, sans-serif);
            font-size: 14px;
            font-weight: 600;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.25s ease, transform 0.25s ease;
            white-space: nowrap;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Auto-remove after 2.5s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    /**
     * Handle buy ingredients button
     */
    handleBuyIngredients() {
        // Get shopping links
        const links = DeepLinks.getShoppingLinks(this.currentFood.ingredients);

        // Set up shopping app links
        document.getElementById('blinkit-link').href = links.blinkit;
        document.getElementById('instamart-link').href = links.instamart;
        document.getElementById('zepto-link').href = links.zepto;

        // Show modal
        this.showModal();
    }

    /**
     * Handle show recipe button
     */
    handleShowRecipe() {
        // Update dish name in recipe view
        document.getElementById('recipe-dish-name').textContent = this.currentFood.name;

        // Render recipe
        this.recipeView.render(this.currentFood);

        // Show recipe view
        this.showView('recipe');
    }

    /**
     * Show a specific view
     */
    showView(viewName) {
        // Hide all views
        Object.values(this.views).forEach(view => {
            if (view) view.classList.add('hidden');
        });

        // Show requested view
        const targetView = this.views[viewName];
        if (targetView) {
            Animations.fadeIn(targetView, 400);
        }
    }

    /**
     * Show shopping modal
     */
    showModal() {
        const modal = document.getElementById('shopping-modal');
        Animations.fadeIn(modal, 300);
    }

    /**
     * Hide shopping modal
     */
    hideModal() {
        const modal = document.getElementById('shopping-modal');
        Animations.fadeOut(modal, 300);
    }

    /**
     * Get current time slot for learning engine
     */
    _getCurrentTimeSlot() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 16) return 'lunch';
        if (hour >= 16 && hour < 22) return 'evening';
        return 'night';
    }

    /**
     * Setup ignore tracking for page unload
     */
    _setupIgnoreTracking() {
        window.addEventListener('beforeunload', () => {
            // Only track ignore if user saw a recommendation but didn't interact
            if (this.currentFood && !this.userInteracted) {
                const timeOfDay = this._getCurrentTimeSlot();
                LearningEngine.trackInteraction('ignore', this.currentFood, timeOfDay);
                console.log('🚫 User ignored recommendation:', this.currentFood.name);
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DecydApp();
});
