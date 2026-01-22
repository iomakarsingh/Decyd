// Ingredient List Component - Renders and manages ingredient list

class IngredientList {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    /**
     * Render ingredient list
     * For MVP, we'll mark random ingredients as "missing" to demonstrate the feature
     */
    render(ingredients) {
        if (!ingredients || ingredients.length === 0) return;

        // Clear existing list
        this.container.innerHTML = '';

        // Randomly mark some ingredients as missing (for demo purposes)
        // In production, this would come from user's pantry/inventory
        const ingredientsWithStatus = ingredients.map((ingredient, index) => ({
            name: ingredient,
            available: Math.random() > 0.3 // 70% chance of being available
        }));

        // Render each ingredient
        ingredientsWithStatus.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item.name;

            if (!item.available) {
                li.classList.add('missing');
            }

            // Initially hide for stagger animation
            li.style.opacity = '0';
            li.style.transform = 'translateY(10px)';

            this.container.appendChild(li);
        });

        // Stagger animation
        this.animateIn();

        // Return whether there are missing ingredients
        return ingredientsWithStatus.some(item => !item.available);
    }

    /**
     * Animate ingredients in with stagger effect
     */
    animateIn() {
        const items = this.container.querySelectorAll('li');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    /**
     * Get list of missing ingredients
     */
    getMissingIngredients() {
        const missingItems = this.container.querySelectorAll('li.missing');
        return Array.from(missingItems).map(item => item.textContent);
    }

    /**
     * Clear the list
     */
    clear() {
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
window.IngredientList = IngredientList;
