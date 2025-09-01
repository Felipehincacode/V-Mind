// ===== LOGIN SIMPLE Y FUNCIONAL =====

class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('loginButton');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        this.setLoading(true);
        
        try {
            const formData = this.getFormData();
            const result = await this.performLogin(formData);
            
            if (result.success) {
                this.handleLoginSuccess(result);
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            this.showError('Error de conexión. Verifica que el backend esté ejecutándose.');
        } finally {
            this.setLoading(false);
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
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.username,
                    password: formData.password
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    user: data.data.user,
                    token: data.data.token,
                    message: 'Login exitoso'
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Error en el login'
                };
            }
            
        } catch (error) {
            console.error('Error durante el login:', error);
            throw error;
        }
    }

    handleLoginSuccess(result) {
        // Guardar token y datos del usuario
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userData', JSON.stringify(result.user));
        
        // Mostrar mensaje de éxito
        this.showSuccess('¡Login exitoso! Redirigiendo...');
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    setLoading(loading) {
        if (loading) {
            this.loginButton.disabled = true;
            this.loginButton.innerHTML = 'Iniciando sesión...';
        } else {
            this.loginButton.disabled = false;
            this.loginButton.innerHTML = 'Iniciar Sesión';
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// ===== ESTILOS ADICIONALES =====
const style = document.createElement('style');
style.textContent = `
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
