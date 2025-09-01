// ===== SERVICIO API CENTRALIZADO =====

import { VMindConfig, getConfig, getApiUrl } from '../config.js';

class ApiService {
    constructor() {
        this.baseUrl = VMindConfig.API.BASE_URL;
        this.timeout = VMindConfig.API.TIMEOUT;
        this.retryAttempts = VMindConfig.API.RETRY_ATTEMPTS;
        this.authToken = this.getAuthToken();
        this.refreshToken = this.getRefreshToken();
    }

    // ===== GESTIÓN DE TOKENS =====
    getAuthToken() {
        return localStorage.getItem(VMindConfig.AUTH.TOKEN_KEY);
    }

    getRefreshToken() {
        return localStorage.getItem(VMindConfig.AUTH.REFRESH_TOKEN_KEY);
    }

    setAuthToken(token) {
        this.authToken = token;
        localStorage.setItem(VMindConfig.AUTH.TOKEN_KEY, token);
    }

    setRefreshToken(token) {
        this.refreshToken = token;
        localStorage.setItem(VMindConfig.AUTH.REFRESH_TOKEN_KEY, token);
    }

    clearTokens() {
        this.authToken = null;
        this.refreshToken = null;
        localStorage.removeItem(VMindConfig.AUTH.TOKEN_KEY);
        localStorage.removeItem(VMindConfig.AUTH.REFRESH_TOKEN_KEY);
        localStorage.removeItem(VMindConfig.AUTH.USER_DATA_KEY);
    }

    // ===== MÉTODO PRINCIPAL DE REQUEST =====
    async request(endpoint, options = {}) {
        const url = getApiUrl(endpoint);
        console.log('🌐 Haciendo request a:', url);
        console.log('📦 Datos enviados:', options.body);
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Agregar token de autenticación si existe
        if (this.authToken) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        // Agregar timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // Manejar errores de red
            if (!response.ok) {
                if (response.status === 401 && this.authToken) {
                    // Solo intentar refresh si ya tenemos un token (no para login)
                    const refreshed = await this.refreshAuthToken();
                    if (refreshed) {
                        // Reintentar la petición original
                        return this.request(endpoint, options);
                    } else {
                        // Refresh falló, redirigir a login
                        this.handleAuthError();
                        throw new ApiError('Sesión expirada', 401);
                    }
                }
                
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    errorData.message || `Error ${response.status}`,
                    response.status,
                    errorData
                );
            }

            const data = await response.json();
            console.log('📥 Respuesta recibida:', data);
            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new ApiError('Timeout: La petición tardó demasiado', 408);
            }
            
            if (error instanceof ApiError) {
                throw error;
            }
            
            throw new ApiError('Error de conexión', 0, { originalError: error });
        }
    }

    // ===== REFRESH DE TOKEN =====
    async refreshAuthToken() {
        if (!this.refreshToken) {
            return false;
        }

        try {
            const response = await fetch(getApiUrl(VMindConfig.API.ENDPOINTS.AUTH.REFRESH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.setAuthToken(data.token);
                this.setRefreshToken(data.refreshToken);
                return true;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }

        return false;
    }

    // ===== MANEJO DE ERRORES DE AUTENTICACIÓN =====
    handleAuthError() {
        this.clearTokens();
        // Redirigir a login
        if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
        }
    }

    // ===== MÉTODOS DE AUTENTICACIÓN =====
    async login(credentials) {
        console.log('🔐 Intentando login con:', credentials);
        console.log('🔗 Endpoint:', VMindConfig.API.ENDPOINTS.AUTH.LOGIN);
        
        const data = await this.request(VMindConfig.API.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        console.log('✅ Login exitoso:', data);

        this.setAuthToken(data.token);
        this.setRefreshToken(data.refreshToken);
        localStorage.setItem(VMindConfig.AUTH.USER_DATA_KEY, JSON.stringify(data.user));

        return data;
    }

    async register(userData) {
        const data = await this.request(VMindConfig.API.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        return data;
    }

    async logout() {
        try {
            await this.request(VMindConfig.API.ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            this.clearTokens();
        }
    }

    async getProfile() {
        return await this.request(VMindConfig.API.ENDPOINTS.AUTH.PROFILE);
    }

    // ===== MÉTODOS DE USUARIO =====
    async getUserStats() {
        return await this.request(VMindConfig.API.ENDPOINTS.USERS.STATS);
    }

    async getUserInterests() {
        return await this.request(VMindConfig.API.ENDPOINTS.USERS.INTERESTS);
    }

    async updateProfile(profileData) {
        return await this.request(VMindConfig.API.ENDPOINTS.AUTH.PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // ===== MÉTODOS DE ROADMAPS =====
    async getRoadmaps() {
        return await this.request(VMindConfig.API.ENDPOINTS.ROADMAPS.LIST);
    }

    async getRoadmap(id) {
        return await this.request(VMindConfig.API.ENDPOINTS.ROADMAPS.DETAIL.replace(':id', id));
    }

    async createRoadmap(roadmapData) {
        return await this.request(VMindConfig.API.ENDPOINTS.ROADMAPS.CREATE, {
            method: 'POST',
            body: JSON.stringify(roadmapData)
        });
    }

    async updateRoadmap(id, roadmapData) {
        return await this.request(VMindConfig.API.ENDPOINTS.ROADMAPS.UPDATE.replace(':id', id), {
            method: 'PUT',
            body: JSON.stringify(roadmapData)
        });
    }

    async deleteRoadmap(id) {
        return await this.request(VMindConfig.API.ENDPOINTS.ROADMAPS.DELETE.replace(':id', id), {
            method: 'DELETE'
        });
    }

    // ===== MÉTODOS DE TAREAS =====
    async getTasks() {
        return await this.request(VMindConfig.API.ENDPOINTS.TASKS.LIST);
    }

    async getTask(id) {
        return await this.request(VMindConfig.API.ENDPOINTS.TASKS.DETAIL.replace(':id', id));
    }

    async completeTask(id) {
        return await this.request(VMindConfig.API.ENDPOINTS.TASKS.COMPLETE.replace(':id', id), {
            method: 'POST'
        });
    }

    async getTaskProgress() {
        return await this.request(VMindConfig.API.ENDPOINTS.TASKS.PROGRESS);
    }

    // ===== MÉTODOS DE NOTAS =====
    async getNotes() {
        return await this.request(VMindConfig.API.ENDPOINTS.USERS.NOTES);
    }

    async createNote(noteData) {
        return await this.request(VMindConfig.API.ENDPOINTS.USERS.NOTES, {
            method: 'POST',
            body: JSON.stringify(noteData)
        });
    }

    async updateNote(id, noteData) {
        return await this.request(`${VMindConfig.API.ENDPOINTS.USERS.NOTES}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(noteData)
        });
    }

    async deleteNote(id) {
        return await this.request(`${VMindConfig.API.ENDPOINTS.USERS.NOTES}/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== MÉTODOS DE RECURSOS =====
    async getResources() {
        return await this.request(VMindConfig.API.ENDPOINTS.USERS.RESOURCES);
    }

    async createResource(resourceData) {
        return await this.request(VMindConfig.API.ENDPOINTS.USERS.RESOURCES, {
            method: 'POST',
            body: JSON.stringify(resourceData)
        });
    }

    async updateResource(id, resourceData) {
        return await this.request(`${VMindConfig.API.ENDPOINTS.USERS.RESOURCES}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(resourceData)
        });
    }

    async deleteResource(id) {
        return await this.request(`${VMindConfig.API.ENDPOINTS.USERS.RESOURCES}/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== UTILIDADES =====
    isAuthenticated() {
        return !!this.authToken;
    }

    getUserData() {
        const userData = localStorage.getItem(VMindConfig.AUTH.USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    }
}

// ===== CLASE DE ERROR PERSONALIZADA =====
class ApiError extends Error {
    constructor(message, status = 0, data = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    toString() {
        return `ApiError [${this.status}]: ${this.message}`;
    }
}

// ===== INSTANCIA GLOBAL =====
const apiService = new ApiService();

// ===== LOGGING EN DESARROLLO =====
if (VMindConfig.APP.DEBUG) {
    console.log('🔧 API Service inicializado:', {
        baseUrl: apiService.baseUrl,
        timeout: apiService.timeout,
        retryAttempts: apiService.retryAttempts
    });
}

export { apiService, ApiError };

