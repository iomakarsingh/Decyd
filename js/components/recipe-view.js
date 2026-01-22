// Recipe View Component - Renders recipe video and steps

class RecipeView {
    constructor() {
        this.videoElement = document.getElementById('recipe-video');
        this.stepsContainer = document.getElementById('recipe-steps');
    }

    /**
     * Render recipe with video and steps
     */
    render(food) {
        if (!food) return;

        // Set video URL
        this.videoElement.src = food.videoUrl;

        // Render steps
        this.renderSteps(food.steps);
    }

    /**
     * Render recipe steps
     */
    renderSteps(steps) {
        if (!steps || steps.length === 0) return;

        // Clear existing steps
        this.stepsContainer.innerHTML = '';

        // Render each step
        steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = step;

            // Initially hide for stagger animation
            li.style.opacity = '0';
            li.style.transform = 'translateY(10px)';

            this.stepsContainer.appendChild(li);
        });

        // Stagger animation
        this.animateStepsIn();
    }

    /**
     * Animate steps in with stagger effect
     */
    animateStepsIn() {
        const steps = this.stepsContainer.querySelectorAll('li');
        steps.forEach((step, index) => {
            setTimeout(() => {
                step.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            }, index * 80);
        });
    }

    /**
     * Clear recipe view
     */
    clear() {
        this.videoElement.src = '';
        this.stepsContainer.innerHTML = '';
    }
}

// Export for use in other modules
window.RecipeView = RecipeView;
