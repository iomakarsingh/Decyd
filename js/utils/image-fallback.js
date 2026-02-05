/**
 * Image Fallback System
 * Handles broken images with beautiful emoji + gradient placeholders
 */

const ImageFallback = {
    // Cuisine-based emoji fallbacks
    emojiMap: {
        'Indian': '🍛',
        'Italian': '🍝',
        'Mexican': '🌮',
        'Japanese': '🍱',
        'Chinese': '🥡',
        'Thai': '🍜',
        'American': '🍔',
        'French': '🥐',
        'Greek': '🥙',
        'Spanish': '🥘',
        'Korean': '🍲',
        'Vietnamese': '🍜',
        'Mediterranean': '🥗',
        'Middle Eastern': '🥙',
        'International': '🍽️'
    },

    // Gradient backgrounds by cuisine
    gradientMap: {
        'Indian': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'Italian': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'Mexican': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'Japanese': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'Chinese': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'Thai': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'American': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'French': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        'Greek': 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
        'Spanish': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        'Korean': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'Vietnamese': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        'Mediterranean': 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
        'Middle Eastern': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'International': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },

    /**
     * Setup fallback for all images on page
     */
    setupFallbacks() {
        document.querySelectorAll('img[data-cuisine]').forEach(img => {
            img.addEventListener('error', (e) => {
                this.handleError(e.target);
            });
        });
    },

    /**
     * Handle image error
     */
    handleError(imgElement) {
        const cuisine = imgElement.dataset.cuisine || 'International';
        const emoji = this.emojiMap[cuisine] || '🍽️';
        const gradient = this.gradientMap[cuisine] || this.gradientMap['International'];

        // Hide broken image
        imgElement.style.display = 'none';

        // Check if fallback already exists
        const existingFallback = imgElement.parentElement.querySelector('.image-fallback');
        if (existingFallback) {
            return; // Already handled
        }

        // Create fallback element
        const fallback = document.createElement('div');
        fallback.className = 'image-fallback';
        fallback.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${gradient};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 120px;
            animation: fadeIn 0.3s ease;
        `;
        fallback.textContent = emoji;

        // Add to container
        imgElement.parentElement.appendChild(fallback);

        console.log(`🖼️ Image fallback applied for ${cuisine} cuisine`);
    },

    /**
     * Manually trigger fallback for an image
     */
    applyFallback(imgElement, cuisine) {
        imgElement.dataset.cuisine = cuisine;
        this.handleError(imgElement);
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ImageFallback = ImageFallback;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ImageFallback.setupFallbacks();
    });
} else {
    ImageFallback.setupFallbacks();
}
