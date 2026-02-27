// Context Detector - Analyzes time, day, and real weather for recommendations

class ContextDetector {
    constructor() {
        this.context = {
            timeOfDay: '',
            mealType: '',
            dayType: '',
            weather: '',
            weatherDesc: '',   // Human-readable: "Partly cloudy", "Heavy rain", etc.
            tempC: null,
            timestamp: null
        };

        // Cache weather for 15 minutes — no need to re-fetch every render
        this._weatherCache = null;
        this._weatherCacheTime = 0;
        this._CACHE_TTL_MS = 15 * 60 * 1000;
    }

    /**
     * Get current context based on time, day, and real weather
     */
    async detectContext() {
        const now = new Date();
        this.context.timestamp = now;

        this.detectTimeAndMeal(now);
        this.detectDayType(now);
        await this.detectWeather();

        return this.context;
    }

    /**
     * Determine time of day and meal type
     */
    detectTimeAndMeal(date) {
        const hour = date.getHours();

        if (hour >= 6 && hour < 10) {
            this.context.timeOfDay = 'morning';
            this.context.mealType = 'breakfast';
        } else if (hour >= 10 && hour < 12) {
            this.context.timeOfDay = 'mid-morning';
            this.context.mealType = 'snack';
        } else if (hour >= 12 && hour < 15) {
            this.context.timeOfDay = 'afternoon';
            this.context.mealType = 'lunch';
        } else if (hour >= 15 && hour < 18) {
            this.context.timeOfDay = 'eve-snack';
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
     * Determine weekday vs weekend
     */
    detectDayType(date) {
        const day = date.getDay();
        this.context.dayType = (day === 0 || day === 6) ? 'weekend' : 'weekday';
    }

    /**
     * Detect real weather via Open-Meteo API (free, no key required)
     * Falls back gracefully if location is denied or network fails
     */
    async detectWeather() {
        // Return cached result if still fresh
        if (this._weatherCache && (Date.now() - this._weatherCacheTime < this._CACHE_TTL_MS)) {
            this.context.weather = this._weatherCache.weather;
            this.context.weatherDesc = this._weatherCache.weatherDesc;
            this.context.tempC = this._weatherCache.tempC;
            console.log('🌤️ Using cached weather:', this._weatherCache);
            return;
        }

        try {
            const coords = await this._getCoordinates();
            await this._fetchOpenMeteo(coords.lat, coords.lon);
        } catch (err) {
            console.warn('⚠️ Weather detection failed, using time-based fallback:', err.message);
            this._applyTimeBasedFallback();
        }
    }

    /**
     * Get user coordinates — tries GPS first, falls back to IP geolocation
     */
    _getCoordinates() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                return this._ipLocationFallback().then(resolve).catch(reject);
            }

            navigator.geolocation.getCurrentPosition(
                pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                _err => {
                    console.warn('📍 GPS denied, trying IP-based location...');
                    this._ipLocationFallback().then(resolve).catch(reject);
                },
                { timeout: 5000, maximumAge: 600000 }
            );
        });
    }

    /**
     * IP-based location fallback using ip-api.com (free, no key)
     */
    async _ipLocationFallback() {
        const res = await fetch('https://ip-api.com/json/?fields=lat,lon,city', { signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error('IP location failed');
        const data = await res.json();
        if (!data.lat) throw new Error('No coordinates from IP API');
        console.log('📍 Location via IP:', data.city, data.lat, data.lon);
        return { lat: data.lat, lon: data.lon };
    }

    /**
     * Fetch current weather from Open-Meteo
     * Free API, no key required: https://open-meteo.com/en/docs
     */
    async _fetchOpenMeteo(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
            + `&current=temperature_2m,weathercode,apparent_temperature`
            + `&temperature_unit=celsius&timezone=auto`;

        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
        const data = await res.json();

        const current = data.current;
        const wmoCode = current.weathercode;
        const tempC = Math.round(current.temperature_2m);
        const feelsLike = Math.round(current.apparent_temperature);

        const { category, desc } = this._mapWMOCode(wmoCode, tempC);

        this.context.weather = category;
        this.context.weatherDesc = desc;
        this.context.tempC = tempC;

        // Cache it
        this._weatherCache = { weather: category, weatherDesc: desc, tempC };
        this._weatherCacheTime = Date.now();

        console.log(`🌤️ Real weather: ${desc} (${tempC}°C, feels like ${feelsLike}°C) → category: ${category}`);
    }

    /**
     * Map WMO weather codes to internal categories + display description
     * Full code reference: https://open-meteo.com/en/docs#weathervariables
     */
    _mapWMOCode(code, tempC) {
        // Thunderstorm
        if ([95, 96, 99].includes(code)) return { category: 'rainy', desc: 'Thunderstorm ⛈️' };

        // Snow / freezing rain
        if ([66, 67, 71, 73, 75, 77, 85, 86].includes(code)) return { category: 'cold', desc: 'Snowy 🌨️' };

        // Rain / drizzle / showers
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { category: 'rainy', desc: 'Rainy 🌧️' };

        // Light drizzle
        if ([40, 41, 42, 43, 44, 45, 46, 47, 48, 49].includes(code)) return { category: 'rainy', desc: 'Drizzly 🌦️' };

        // Fog / mist
        if ([45, 48].includes(code)) return { category: 'cold', desc: 'Foggy 🌫️' };

        // Clear sky (code 0) — decide by temp
        if (code === 0) {
            if (tempC >= 35) return { category: 'hot', desc: 'Scorching ☀️' };
            if (tempC >= 28) return { category: 'hot', desc: 'Hot & sunny ☀️' };
            if (tempC >= 18) return { category: 'pleasant', desc: 'Clear & sunny 😊' };
            if (tempC >= 10) return { category: 'cold', desc: 'Cool & clear 🌤️' };
            return { category: 'cold', desc: 'Cold & clear ❄️' };
        }

        // Partly / mainly cloudy (codes 1–3)
        if ([1, 2, 3].includes(code)) {
            if (tempC >= 30) return { category: 'hot', desc: 'Humid & cloudy 🌥️' };
            if (tempC >= 18) return { category: 'pleasant', desc: 'Partly cloudy 🌤️' };
            return { category: 'cold', desc: 'Overcast & cool ☁️' };
        }

        // Default — temperature-only fallback
        if (tempC >= 30) return { category: 'hot', desc: 'Hot 🔥' };
        if (tempC >= 18) return { category: 'pleasant', desc: 'Pleasant 😊' };
        return { category: 'cold', desc: 'Cold ❄️' };
    }

    /**
     * Fallback when all weather APIs fail — uses time-of-day heuristic
     */
    _applyTimeBasedFallback() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 10) { this.context.weather = 'pleasant'; this.context.weatherDesc = 'Morning 🌅'; }
        else if (hour >= 12 && hour < 17) { this.context.weather = 'hot'; this.context.weatherDesc = 'Afternoon ☀️'; }
        else if (hour >= 18 && hour < 22) { this.context.weather = 'pleasant'; this.context.weatherDesc = 'Evening 🌆'; }
        else { this.context.weather = 'cold'; this.context.weatherDesc = 'Night 🌙'; }
    }

    /**
     * Build human-readable context badge for the header
     */
    getContextBadge() {
        const { timeOfDay, weather, weatherDesc, tempC, dayType } = this.context;

        const timeDisplay = {
            'morning': { emoji: '🌅', label: 'Morning' },
            'mid-morning': { emoji: '☀️', label: 'Late Morning' },
            'afternoon': { emoji: '☀️', label: 'Afternoon' },
            'eve-snack': { emoji: '🌤️', label: 'Late Afternoon' },
            'evening': { emoji: '🌆', label: 'Evening' },
            'night': { emoji: '🌙', label: 'Night' }
        };

        const t = timeDisplay[timeOfDay] || { emoji: '🕐', label: timeOfDay };
        const weatherLabel = weatherDesc || this._capitalize(weather);
        const tempLabel = tempC !== null ? ` · ${tempC}°C` : '';
        const dayLabel = dayType === 'weekend' ? ' · Weekend' : '';

        return `${t.emoji} ${t.label} · ${weatherLabel}${tempLabel}${dayLabel}`;
    }

    _capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getCurrentContext() {
        return this.context;
    }
}

// Export
window.ContextDetector = ContextDetector;
