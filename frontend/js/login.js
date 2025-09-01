// ===== FUNCIONALIDAD DE LOGIN REFACTORIZADA =====

import { apiService, ApiError } from './services/api.js';
import { getConfig } from './config.js';

class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('loginButton');
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Evento de submit del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Eventos de input para validación en tiempo real
        this.usernameInput.addEventListener('input', () => this.validateField('username'));
        this.passwordInput.addEventListener('input', () => this.validateField('password'));
        
        // Eventos de focus para mejorar UX
        this.usernameInput.addEventListener('focus', () => this.clearError('username'));
        this.passwordInput.addEventListener('focus', () => this.clearError('password'));
        
        // Enlaces adicionales
        document.getElementById('registerLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.redirectToRegister();
        });
        
        document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
    }

    setupFormValidation() {
        // Configuración de validación
        this.validationRules = {
            username: {
                required: true,
                minLength: 3,
                pattern: /^[a-zA-Z0-9@._-]+$/
            },
            password: {
                required: true,
                minLength: 6
            }
        };
    }

    setupAnimations() {
        // Animaciones de entrada escalonadas
        const formElements = this.form.querySelectorAll('.form-group, .login-button');
        formElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        // Validar todos los campos
        const isValid = this.validateAllFields();
        if (!isValid) return;
        
        // Iniciar proceso de login
        this.setLoading(true);
        
        try {
            const formData = this.getFormData();
            const result = await this.performLogin(formData);
            
            if (result.success) {
                this.handleLoginSuccess(result);
            } else {
                this.handleLoginError(result.message);
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            this.handleLoginError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            this.setLoading(false);
        }
    }

    validateAllFields() {
        let isValid = true;
        
        for (const fieldName in this.validationRules) {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        }
        
        return isValid;
    }

    validateField(fieldName) {
        const input = document.getElementById(fieldName);
        const rules = this.validationRules[fieldName];
        const value = input.value.trim();
        
        // Limpiar errores previos
        this.clearError(fieldName);
        
        // Validar campo requerido
        if (rules.required && !value) {
            this.showError(fieldName, 'Este campo es requerido');
            return false;
        }
        
        // Validar longitud mínima
        if (rules.minLength && value.length < rules.minLength) {
            this.showError(fieldName, `Debe tener al menos ${rules.minLength} caracteres`);
            return false;
        }
        
        // Validar patrón
        if (rules.pattern && !rules.pattern.test(value)) {
            if (fieldName === 'username') {
                this.showError(fieldName, 'Formato de usuario o email inválido');
            }
            return false;
        }
        
        // Validaciones específicas
        if (fieldName === 'username' && value.includes('@')) {
            // Validación básica de email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                this.showError(fieldName, 'Formato de email inválido');
                return false;
            }
        }
        
        return true;
    }

    showError(fieldName, message) {
        const group = document.getElementById(`${fieldName}Group`);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        group.classList.add('error');
        errorElement.textContent = message;
        
        // Animación de shake
        const input = document.getElementById(fieldName);
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }

    clearError(fieldName) {
        const group = document.getElementById(`${fieldName}Group`);
        group.classList.remove('error');
    }

    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.loginButton.classList.add('loading');
            this.loginButton.disabled = true;
        } else {
            this.loginButton.classList.remove('loading');
            this.loginButton.disabled = false;
        }
    }

    getFormData() {
        return {
            username: this.usernameInput.value.trim(),
            password: this.passwordInput.value
        };
    }

    async performLogin(formData) {
        try {
            // Usar el nuevo servicio de API
            const result = await apiService.login({
                email: formData.username,
                passwords: formData.password
            });
            
            if (result.success) {
                return {
                    success: true,
                    user: {
                        id: result.data.user.user_id,
                        username: result.data.user.user_name,
                        email: result.data.user.email,
                        name: result.data.user.user_name,
                        level: result.data.user.current_level,
                        objetive: result.data.user.objetive,
                        rol: result.data.user.rol
                    },
                    token: result.data.token,
                    message: 'Login exitoso'
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Error en el login'
                };
            }
            
        } catch (error) {
            console.error('Error durante el login:', error);
            
            if (error instanceof ApiError) {
                return {
                    success: false,
                    message: error.message,
                    status: error.status
                };
            }
            
            return {
                success: false,
                message: 'Error de conexión. Verifica que el backend esté ejecutándose.'
            };
        }
    }

    // ===== MÉTODO DE DEMO PARA DESARROLLO =====
    async performLoginDemo(formData) {
        // NOTA: Este método se puede usar durante el desarrollo
        // Eliminar cuando el backend esté listo
        return new Promise((resolve) => {
            setTimeout(() => {
                if (formData.username === 'demo' && formData.password === 'demo123') {
                    resolve({
                        success: true,
                        user: {
                            id: 1,
                            username: formData.username,
                            email: 'demo@vmind.com',
                            name: 'Usuario Demo'
                        },
                        token: 'demo-jwt-token-' + Date.now(),
                        refreshToken: 'demo-refresh-token'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Usuario o contraseña incorrectos'
                    });
                }
            }, 1000);
        });
    }

    handleLoginSuccess(result) {
        // Guardar token y datos del usuario usando la configuración centralizada
        apiService.setAuthToken(result.token);
        localStorage.setItem(getConfig('AUTH.USER_DATA_KEY'), JSON.stringify(result.user));
        
        // Guardar refresh token si existe
        if (result.refreshToken) {
            localStorage.setItem(getConfig('AUTH.REFRESH_TOKEN_KEY'), result.refreshToken);
        }
        
        // Guardar timestamp del login
        localStorage.setItem('loginTimestamp', Date.now().toString());
        
        // Mostrar mensaje de éxito personalizado
        const welcomeMessage = result.user.name ? 
            `¡Bienvenido de vuelta, ${result.user.name}!` : 
            '¡Bienvenido de vuelta!';
        
        this.showSuccessMessage(welcomeMessage);
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            // Verificar si hay una URL de redirección guardada
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'dashboard.html';
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl;
        }, 1500);
    }

    handleLoginError(result) {
        // Manejar diferentes tipos de errores de base de datos
        if (result.errors && Object.keys(result.errors).length > 0) {
            // Errores de validación específicos por campo
            this.handleValidationErrors(result.errors);
        } else {
            // Error general
            this.showGlobalError(result.message);
        }
        
        // Manejar errores específicos por código de estado
        if (result.status) {
            this.handleStatusSpecificErrors(result.status);
        }
        
        // Limpiar campos sensibles
        this.passwordInput.value = '';
        this.passwordInput.focus();
    }

    handleValidationErrors(errors) {
        // Limpiar errores previos
        this.clearAllErrors();
        
        // Mostrar errores específicos por campo
        for (const [field, messages] of Object.entries(errors)) {
            const message = Array.isArray(messages) ? messages[0] : messages;
            
            if (field === 'username' || field === 'email') {
                this.showError('username', message);
            } else if (field === 'password') {
                this.showError('password', message);
            }
        }
    }

    handleStatusSpecificErrors(status) {
        switch (status) {
            case 429: // Too Many Requests
                this.disableFormTemporarily(300000); // 5 minutos
                break;
            case 423: // Locked Account
                this.showAccountLockedMessage();
                break;
            case 451: // Account Suspended
                this.showAccountSuspendedMessage();
                break;
        }
    }

    clearAllErrors() {
        ['username', 'password'].forEach(field => this.clearError(field));
    }

    disableFormTemporarily(milliseconds) {
        this.form.style.pointerEvents = 'none';
        this.form.style.opacity = '0.6';
        
        setTimeout(() => {
            this.form.style.pointerEvents = '';
            this.form.style.opacity = '';
        }, milliseconds);
    }

    showAccountLockedMessage() {
        this.showGlobalError(
            'Tu cuenta ha sido bloqueada por múltiples intentos fallidos. ' +
            'Intenta de nuevo más tarde o contacta al soporte.',
            8000
        );
    }

    showAccountSuspendedMessage() {
        this.showGlobalError(
            'Tu cuenta ha sido suspendida. Contacta al soporte para más información.',
            10000
        );
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: var(--gradient-primary);
            color: white;
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-card);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    showGlobalError(message, duration = 4000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'global-error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: var(--error);
            color: white;
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-card);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, duration);
    }

    redirectToRegister() {
        // Implementar redirección a página de registro
        console.log('Redirigir a registro');
        window.location.href = 'register.html';
    }

    handleForgotPassword() {
        // Implementar funcionalidad de recuperación de contraseña
        console.log('Recuperar contraseña');
        // window.location.href = 'forgot-password.html';
    }
}

// ===== ANIMACIONES ADICIONALES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// ===== UTILIDADES ADICIONALES =====
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Usuario ya autenticado, redirigir
        window.location.href = 'dashboard.html';
    }
}

// Verificar si el usuario ya está autenticado
checkAuthStatus();
