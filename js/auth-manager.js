// Authentication Manager - Handles user registration, login, and session management

class AuthManager {
    constructor() {
        this.storageKeys = {
            users: 'decyd_users',
            session: 'decyd_session'
        };
    }

    /**
     * Initialize users storage if it doesn't exist
     */
    initStorage() {
        if (!localStorage.getItem(this.storageKeys.users)) {
            localStorage.setItem(this.storageKeys.users, JSON.stringify({}));
        }
    }

    /**
     * Generate a unique user ID
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate a session token
     */
    generateToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    /**
     * Hash password (simple for MVP - NOT production ready)
     */
    hashPassword(password) {
        // In production, use proper hashing (bcrypt, etc.)
        // This is just a simple obfuscation for demo
        return btoa(password + 'decyd_salt');
    }

    /**
     * Verify password
     */
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    /**
     * Get all users
     */
    getUsers() {
        this.initStorage();
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.users)) || {};
        } catch (e) {
            console.error('Error loading users:', e);
            return {};
        }
    }

    /**
     * Save users
     */
    saveUsers(users) {
        try {
            localStorage.setItem(this.storageKeys.users, JSON.stringify(users));
        } catch (e) {
            console.error('Error saving users:', e);
        }
    }

    /**
     * Register a new user
     */
    register(name, email, password, country) {
        this.initStorage();
        const users = this.getUsers();

        // Check if email already exists
        const existingUser = Object.values(users).find(u => u.email === email.toLowerCase());
        if (existingUser) {
            return { success: false, error: 'Email already registered' };
        }

        // Validate inputs
        if (!name || name.trim().length < 2) {
            return { success: false, error: 'Name must be at least 2 characters' };
        }

        if (!this.isValidEmail(email)) {
            return { success: false, error: 'Invalid email address' };
        }

        if (!password || password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        if (!country) {
            return { success: false, error: 'Please select your country' };
        }

        // Create new user
        const userId = this.generateUserId();
        const user = {
            id: userId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: this.hashPassword(password),
            country: country,
            createdAt: new Date().toISOString()
        };

        users[userId] = user;
        this.saveUsers(users);

        return { success: true, userId, user: this.sanitizeUser(user) };
    }

    /**
     * Login user
     */
    login(email, password, rememberMe = false) {
        const users = this.getUsers();

        // Find user by email
        const user = Object.values(users).find(u => u.email === email.toLowerCase().trim());

        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Verify password
        if (!this.verifyPassword(password, user.password)) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Create session
        const session = this.createSession(user.id, rememberMe);

        return {
            success: true,
            userId: user.id,
            user: this.sanitizeUser(user),
            session
        };
    }

    /**
     * Create a session
     */
    createSession(userId, rememberMe = false) {
        const token = this.generateToken();
        const expiresIn = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
        const expiresAt = new Date(Date.now() + expiresIn).toISOString();

        const session = {
            userId,
            token,
            expiresAt,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(this.storageKeys.session, JSON.stringify(session));
        return session;
    }

    /**
     * Get current session
     */
    getSession() {
        try {
            const session = JSON.parse(localStorage.getItem(this.storageKeys.session));

            if (!session) return null;

            // Check if session is expired
            if (new Date(session.expiresAt) < new Date()) {
                this.logout();
                return null;
            }

            return session;
        } catch (e) {
            console.error('Error loading session:', e);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.getSession() !== null;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        const session = this.getSession();
        if (!session) return null;

        const users = this.getUsers();
        const user = users[session.userId];

        return user ? this.sanitizeUser(user) : null;
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.storageKeys.session);
    }

    /**
     * Remove sensitive data from user object
     */
    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Update user profile
     */
    updateUser(userId, updates) {
        const users = this.getUsers();
        const user = users[userId];

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Update allowed fields
        if (updates.name) user.name = updates.name.trim();
        if (updates.email && this.isValidEmail(updates.email)) {
            // Check if new email is already taken
            const existingUser = Object.values(users).find(
                u => u.email === updates.email.toLowerCase() && u.id !== userId
            );
            if (existingUser) {
                return { success: false, error: 'Email already in use' };
            }
            user.email = updates.email.toLowerCase().trim();
        }

        users[userId] = user;
        this.saveUsers(users);

        return { success: true, user: this.sanitizeUser(user) };
    }

    /**
     * Change password
     */
    changePassword(userId, currentPassword, newPassword) {
        const users = this.getUsers();
        const user = users[userId];

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Verify current password
        if (!this.verifyPassword(currentPassword, user.password)) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Validate new password
        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters' };
        }

        // Update password
        user.password = this.hashPassword(newPassword);
        users[userId] = user;
        this.saveUsers(users);

        return { success: true };
    }
}

// Export for use in other modules
window.AuthManager = AuthManager;
