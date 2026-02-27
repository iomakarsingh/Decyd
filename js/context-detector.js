// Context Detector - Analyzes time, day, and weather to provide context for recommendations

class ContextDetector {
    constructor() {
        this.context = {
            timeOfDay: '',
            mealType: '',
            dayType: '',
            weather: '',
            timestamp: null
        };
    }

    /**
     * Get current context based on time, day, and weather
     * @returns {Object} Context object with all relevant information
     */
    async detectContext() {
        const now = new Date();
        this.context.timestamp = now;

        // Detect time of day and meal type
        this.detectTimeAndMeal(now);

        // Detect day type (weekday vs weekend)
        this.detectDayType(now);

        // Detect weather (mock for MVP)
        await this.detectWeather();

        return this.context;
    }

    /**
     * Determine time of day and appropriate meal type
     */
    detectTimeAndMeal(date) {
        const hour = date.getHours();

        if (hour >= 6 && hour < 10) {
            this.context.timeOfDay = 'morning';
            this.context.mealType = 'breakfast';
        } else if (hour >= 10 && hour < 12) {
            this.context.timeOfDay = 'late-morning';
            this.context.mealType = 'snack';
        } else if (hour >= 12 && hour < 15) {
            this.context.timeOfDay = 'afternoon';
            this.context.mealType = 'lunch';
        } else if (hour >= 15 && hour < 18) {
            this.context.timeOfDay = 'late-afternoon';
            this.context.mealType = 'snack';
        } else if (hour >= 18 && hour < 22) {
            this.context.timeOfDay = 'evening';
            this.context.mealType = 'dinner';
        } else {
            this.context.timeOfDay = 'night';
            this.context.mealType = 'snack';
        }
    }

    /**
     * Determine if it's a weekday or weekend
     */
    detectDayType(date) {
        const day = date.getDay();
        // 0 = Sunday, 6 = Saturday
        this.context.dayType = (day === 0 || day === 6) ? 'weekend' : 'weekday';
    }

    /**
     * Detect weather conditions
     * For MVP, using mock data based on time patterns
     * In production, this would call OpenWeatherMap API
     */
    async detectWeather() {
        // Mock weather logic for MVP
        // You can replace this with actual API call later
        const weatherPatterns = ['pleasant', 'hot', 'cold', 'rainy'];

        // Simple mock: vary by time of day
        const hour = new Date().getHours();

        if (hour >= 6 && hour < 10) {
            this.context.weather = 'pleasant';
        } else if (hour >= 12 && hour < 17) {
            this.context.weather = 'hot';
        } else if (hour >= 18 && hour < 22) {
            this.context.weather = 'pleasant';
        } else {
            this.context.weather = 'cold';
        }

        // Uncomment below to use random weather for testing
        // this.context.weather = weatherPatterns[Math.floor(Math.random() * weatherPatterns.length)];
    }

    /**
     * Get a human-readable context badge text
     */
    getContextBadge() {
        const { timeOfDay, weather, dayType } = this.context;

        const timeEmojis = {
            'morning': '🌅',
            'late-morning': '☀️',
            'afternoon': '☀️',
            'late-afternoon': '🌤️',
            'evening': '🌆',
            'night': '🌙'
        };

        const weatherEmojis = {
            'pleasant': '😊',
            'hot': '🔥',
            'cold': '❄️',
            'rainy': '🌧️'
        };

        return `${timeEmojis[timeOfDay] || ''} ${this.capitalize(timeOfDay)} • ${weatherEmojis[weather] || ''} ${this.capitalize(weather)}`;
    }

    /**
     * Capitalize first letter of string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Get current context without re-detecting
     */
    getCurrentContext() {
        return this.context;
    }
}

// Export for use in other modules
window.ContextDetector = ContextDetector;
