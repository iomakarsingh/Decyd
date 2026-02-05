// Food Card Component - Renders the hero food card

class FoodCard {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.imageElement = document.getElementById('food-image');
        this.nameElement = document.getElementById('food-name');
        this.cuisineElement = document.getElementById('food-cuisine');
        this.reasonElement = document.getElementById('food-reason');
    }

    /**
     * Render food card with data
     */
    render(food, reason) {
        if (!food) return;

        // Update image with cuisine data for fallback
        this.imageElement.src = food.image;
        this.imageElement.alt = food.name;
        this.imageElement.dataset.cuisine = food.cuisine || 'International';

        // Update text content
        this.cuisineElement.textContent = food.cuisine || 'International';
        this.nameElement.textContent = food.name;
        this.reasonElement.textContent = reason;

        // Add entrance animation
        this.container.classList.add('fade-in');
    }

    /**
     * Update card with new food (with transition)
     */
    update(food, reason) {
        // Fade out
        this.container.style.opacity = '0';
        this.container.style.transform = 'scale(0.95)';

        setTimeout(() => {
            this.render(food, reason);

            // Fade in
            setTimeout(() => {
                this.container.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
                this.container.style.opacity = '1';
                this.container.style.transform = 'scale(1)';
            }, 50);
        }, 300);
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.imageElement.src = '';
        this.cuisineElement.textContent = '';
        this.nameElement.textContent = 'Finding your perfect meal...';
        this.reasonElement.textContent = '';
    }
}

// Export for use in other modules
window.FoodCard = FoodCard;
