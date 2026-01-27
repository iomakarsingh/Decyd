// Landing Page JavaScript - Smooth scroll and animations

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for feature cards animation
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger card falling animation
                const cards = entry.target.querySelectorAll('.feature-card');
                cards.forEach(card => {
                    card.classList.add('animate');
                });
                // Unobserve after animation triggers (only animate once)
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px'
    });

    // Observe the features section
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        cardObserver.observe(featuresSection);
    }

    // Intersection Observer for section headers
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const title = entry.target.querySelector('.section-title');
                const subtitle = entry.target.querySelector('.section-subtitle');

                if (title) title.classList.add('animate');
                if (subtitle) subtitle.classList.add('animate');

                headerObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px'
    });

    // Observe all section headers
    document.querySelectorAll('.section-header').forEach(header => {
        headerObserver.observe(header);
    });

    // Intersection Observer for How It Works steps
    const stepsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const steps = entry.target.querySelectorAll('.step');
                const arrows = entry.target.querySelectorAll('.step-arrow');

                steps.forEach(step => {
                    step.classList.add('animate');
                });

                arrows.forEach(arrow => {
                    arrow.classList.add('animate');
                });

                stepsObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px'
    });

    // Observe the How It Works section
    const howItWorksSection = document.querySelector('.how-it-works');
    if (howItWorksSection) {
        stepsObserver.observe(howItWorksSection);
    }

    // Add scroll animations for testimonials
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe testimonials
    document.querySelectorAll('.testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});
