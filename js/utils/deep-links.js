// Deep Links Utility - Generate URLs for external apps

class DeepLinks {
    /**
     * Generate Swiggy search URL
     */
    static getSwiggyUrl(dishName) {
        const query = encodeURIComponent(dishName);
        // Swiggy web search URL
        return `https://www.swiggy.com/search?query=${query}`;
    }

    /**
     * Generate Zomato search URL
     */
    static getZomatoUrl(dishName) {
        const query = encodeURIComponent(dishName);
        // Zomato web search URL
        return `https://www.zomato.com/search?q=${query}`;
    }

    /**
     * Generate Blinkit search URL
     */
    static getBlinkitUrl(ingredients) {
        // For Blinkit, we'll search for the first few key ingredients
        const query = encodeURIComponent(ingredients.slice(0, 3).join(', '));
        return `https://blinkit.com/s/?q=${query}`;
    }

    /**
     * Generate Instamart search URL
     */
    static getInstamartUrl(ingredients) {
        const query = encodeURIComponent(ingredients.slice(0, 3).join(', '));
        return `https://www.swiggy.com/instamart/search?query=${query}`;
    }

    /**
     * Generate Zepto search URL
     */
    static getZeptoUrl(ingredients) {
        const query = encodeURIComponent(ingredients.slice(0, 3).join(', '));
        return `https://www.zepto.com/search?q=${query}`;
    }

    /**
     * Extract ingredient names from full ingredient strings
     * e.g., "Chicken (500g)" -> "Chicken"
     */
    static extractIngredientNames(ingredients) {
        return ingredients.map(ing => {
            // Remove quantities in parentheses
            return ing.split('(')[0].trim();
        });
    }

    /**
     * Get all delivery app links for a dish
     */
    static getDeliveryLinks(dishName) {
        return {
            swiggy: this.getSwiggyUrl(dishName),
            zomato: this.getZomatoUrl(dishName)
        };
    }

    /**
     * Get all shopping app links for ingredients
     */
    static getShoppingLinks(ingredients) {
        const ingredientNames = this.extractIngredientNames(ingredients);

        return {
            blinkit: this.getBlinkitUrl(ingredientNames),
            instamart: this.getInstamartUrl(ingredientNames),
            zepto: this.getZeptoUrl(ingredientNames)
        };
    }
}

// Export for use in other modules
window.DeepLinks = DeepLinks;
