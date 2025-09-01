// ===== CONFIGURACIÓN CENTRALIZADA DE V-MIND =====

const VMindConfig = {
    // Configuración de la API
    API: {
        BASE_URL: 'http://localhost:3000',
        ENDPOINTS: {
                    AUTH: {
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register',
            LOGOUT: '/api/auth/logout',
            REFRESH: '/api/auth/refresh',
            PROFILE: '/api/auth/profile'
        },
                    USERS: {
            PROFILE: '/api/users/profile',
            STATS: '/api/users/stats',
            INTERESTS: '/api/users/interests',
            NOTES: '/api/users/notes',
            RESOURCES: '/api/users/resources'
        },
                    ROADMAPS: {
            LIST: '/api/roadmaps',
            DETAIL: '/api/roadmaps/:id',
            CREATE: '/api/roadmaps',
            UPDATE: '/api/roadmaps/:id',
            DELETE: '/api/roadmaps/:id'
        },
                    TASKS: {
            LIST: '/api/tasks',
            DETAIL: '/api/tasks/:id',
            COMPLETE: '/api/tasks/:id/complete',
            PROGRESS: '/api/tasks/progress'
        }
        },
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3
    },

    // Configuración de la aplicación
    APP: {
        NAME: 'V-Mind',
        VERSION: '2.0.0',
        ENVIRONMENT: 'development',
        DEBUG: true
    },

    // Configuración de autenticación
    AUTH: {
        TOKEN_KEY: 'vmind_auth_token',
        REFRESH_TOKEN_KEY: 'vmind_refresh_token',
        USER_DATA_KEY: 'vmind_user_data',
        TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas en ms
        REFRESH_THRESHOLD: 5 * 60 * 1000 // 5 minutos antes de expirar
    },

    // Configuración de gamificación
    GAMIFICATION: {
        XP_LEVELS: {
            1: { min: 0, max: 99, title: 'Explorador' },
            2: { min: 100, max: 299, title: 'Aventurero' },
            3: { min: 300, max: 599, title: 'Viajero' },
            4: { min: 600, max: 999, title: 'Navegante' },
            5: { min: 1000, max: 1999, title: 'Pionero' },
            6: { min: 2000, max: 3999, title: 'Maestro' },
            7: { min: 4000, max: 9999, title: 'Leyenda' },
            8: { min: 10000, max: Infinity, title: 'Mito' }
        },
        STREAK_BONUS: {
            3: 10,   // 3 días = +10 XP
            7: 25,   // 7 días = +25 XP
            14: 50,  // 14 días = +50 XP
            30: 100, // 30 días = +100 XP
            100: 500 // 100 días = +500 XP
        }
    },

    // Configuración de UI
    UI: {
        THEMES: {
            SPACE: {
                primary: '#1a1a2e',
                secondary: '#16213e',
                accent: '#0f3460',
                highlight: '#e94560',
                text: '#ffffff',
                textSecondary: '#b8b8b8'
            },
            LIGHT: {
                primary: '#ffffff',
                secondary: '#f8f9fa',
                accent: '#007bff',
                highlight: '#28a745',
                text: '#212529',
                textSecondary: '#6c757d'
            }
        },
        ANIMATIONS: {
            DURATION: 300,
            EASING: 'ease-in-out'
        },
        BREAKPOINTS: {
            MOBILE: 768,
            TABLET: 1024,
            DESKTOP: 1200
        }
    },

    // Configuración de almacenamiento
    STORAGE: {
        PREFIX: 'vmind_',
        KEYS: {
            USER_PREFERENCES: 'user_preferences',
            THEME: 'theme',
            LANGUAGE: 'language',
            SOUND_ENABLED: 'sound_enabled',
            NOTIFICATIONS_ENABLED: 'notifications_enabled'
        }
    },

    // Configuración de errores
    ERRORS: {
        NETWORK: 'Error de conexión. Verifica tu internet.',
        AUTH: 'Error de autenticación. Inicia sesión nuevamente.',
        VALIDATION: 'Datos inválidos. Verifica la información.',
        SERVER: 'Error del servidor. Intenta más tarde.',
        UNKNOWN: 'Error desconocido. Contacta soporte.'
    },

    // Configuración de validación
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PASSWORD_MIN_LENGTH: 6,
        USERNAME_MIN_LENGTH: 3,
        USERNAME_MAX_LENGTH: 20
    }
};

// Función para obtener configuración
function getConfig(key = null) {
    if (key) {
        return key.split('.').reduce((obj, k) => obj && obj[k], VMindConfig);
    }
    return VMindConfig;
}

// Función para validar configuración
function validateConfig() {
    const required = ['API.BASE_URL', 'AUTH.TOKEN_KEY'];
    const errors = [];
    
    required.forEach(key => {
        if (!getConfig(key)) {
            errors.push(`Configuración requerida faltante: ${key}`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Función para obtener URL completa de endpoint
function getApiUrl(endpoint, params = {}) {
    const baseUrl = VMindConfig.API.BASE_URL;
    let url = `${baseUrl}${endpoint}`;
    
    // Reemplazar parámetros en la URL
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
}

// Función para obtener configuración de entorno
function getEnvironmentConfig() {
    const env = VMindConfig.APP.ENVIRONMENT;
    
    if (env === 'production') {
        return {
            ...VMindConfig,
            API: {
                ...VMindConfig.API,
                BASE_URL: 'https://api.vmind.com' // URL de producción
            },
            APP: {
                ...VMindConfig.APP,
                DEBUG: false
            }
        };
    }
    
    return VMindConfig;
}

// Exportar configuración
export { VMindConfig, getConfig, validateConfig, getApiUrl, getEnvironmentConfig };
