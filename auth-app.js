// Auth Page Controller - Handles authentication page interactions

document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();

    // Check if already logged in
    if (authManager.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Form elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginFormElement = document.getElementById('login-form-element');
    const signupFormElement = document.getElementById('signup-form-element');

    // Toggle buttons
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');

    // Error elements
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');

    /**
     * Toggle between login and signup forms
     */
    function showLogin() {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        clearErrors();
    }

    function showSignup() {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        clearErrors();
    }

    /**
     * Clear all error messages
     */
    function clearErrors() {
        loginError.classList.add('hidden');
        signupError.classList.add('hidden');
        loginError.textContent = '';
        signupError.textContent = '';
    }

    /**
     * Show error message
     */
    function showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    /**
     * Set button loading state
     */
    function setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    /**
     * Handle login form submission
     */
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        const submitBtn = loginFormElement.querySelector('button[type="submit"]');

        setButtonLoading(submitBtn, true);

        // Simulate async operation
        setTimeout(() => {
            const result = authManager.login(email, password, rememberMe);

            if (result.success) {
                // Redirect to main app
                window.location.href = 'index.html';
            } else {
                showError(loginError, result.error);
                setButtonLoading(submitBtn, false);
            }
        }, 500);
    });

    /**
     * Handle signup form submission
     */
    signupFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const passwordConfirm = document.getElementById('signup-password-confirm').value;
        const country = document.getElementById('signup-country').value;
        const submitBtn = signupFormElement.querySelector('button[type="submit"]');

        // Validate password match
        if (password !== passwordConfirm) {
            showError(signupError, 'Passwords do not match');
            return;
        }

        setButtonLoading(submitBtn, true);

        // Simulate async operation
        setTimeout(() => {
            const result = authManager.register(name, email, password, country);

            if (result.success) {
                // Auto-login after registration
                authManager.login(email, password, false);
                // Redirect to main app
                window.location.href = 'index.html';
            } else {
                showError(signupError, result.error);
                setButtonLoading(submitBtn, false);
            }
        }, 500);
    });

    /**
     * Toggle button event listeners
     */
    showSignupBtn.addEventListener('click', showSignup);
    showLoginBtn.addEventListener('click', showLogin);

    /**
     * Clear error on input
     */
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', clearErrors);
    });

    /**
     * Check URL parameters for mode
     */
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    // Show signup form if mode=signup
    if (mode === 'signup') {
        showSignup();
    }
});
