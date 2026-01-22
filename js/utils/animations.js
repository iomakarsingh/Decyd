// Animation Utilities - Reusable animation functions

class Animations {
    /**
     * Fade in an element
     */
    static fadeIn(element, duration = 400) {
        element.style.opacity = '0';
        element.classList.remove('hidden');

        setTimeout(() => {
            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '1';
        }, 10);
    }

    /**
     * Fade out an element
     */
    static fadeOut(element, duration = 400) {
        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '0';

        setTimeout(() => {
            element.classList.add('hidden');
        }, duration);
    }

    /**
     * Slide up animation
     */
    static slideUp(element, duration = 400) {
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.classList.remove('hidden');

        setTimeout(() => {
            element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }, 10);
    }

    /**
     * Slide down animation (for hiding)
     */
    static slideDown(element, duration = 400) {
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';

        setTimeout(() => {
            element.classList.add('hidden');
            element.style.transform = '';
        }, duration);
    }

    /**
     * Transition between views
     */
    static transitionView(fromView, toView, duration = 400) {
        // Fade out current view
        if (fromView && !fromView.classList.contains('hidden')) {
            this.fadeOut(fromView, duration / 2);
        }

        // Fade in new view after a short delay
        setTimeout(() => {
            this.fadeIn(toView, duration / 2);
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, duration / 2);
    }

    /**
     * Pulse animation for emphasis
     */
    static pulse(element) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'pulse 0.5s ease-out';
        }, 10);
    }

    /**
     * Ripple effect on button click
     */
    static ripple(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Stagger animation for list items
     */
    static staggerIn(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.slideUp(element, 300);
            }, index * delay);
        });
    }
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
window.Animations = Animations;
