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

    // Intersection Observer for CTA section
    const ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const title = entry.target.querySelector('.cta-title');
                const subtitle = entry.target.querySelector('.cta-subtitle');
                const buttons = entry.target.querySelector('.cta-buttons');
                const note = entry.target.querySelector('.cta-note');

                if (title) title.classList.add('animate');
                if (subtitle) subtitle.classList.add('animate');
                if (buttons) buttons.classList.add('animate');
                if (note) note.classList.add('animate');

                ctaObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px'
    });

    // Observe CTA section
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
        ctaObserver.observe(ctaSection);
    }

    // Intersection Observer for Footer
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const brandTitle = entry.target.querySelector('.footer-brand h3');
                const brandText = entry.target.querySelector('.footer-brand p');
                const columns = entry.target.querySelectorAll('.footer-column');
                const bottom = entry.target.querySelector('.footer-bottom');

                if (brandTitle) brandTitle.classList.add('animate');
                if (brandText) brandText.classList.add('animate');
                columns.forEach(col => col.classList.add('animate'));
                if (bottom) bottom.classList.add('animate');

                footerObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px'
    });

    // Observe Footer
    const footer = document.querySelector('.footer');
    if (footer) {
        footerObserver.observe(footer);
    }
});
