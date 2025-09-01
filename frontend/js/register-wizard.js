// ===== REGISTRO SIMPLE Y FUNCIONAL =====

class RegisterWizard {
    constructor() {
        this.TOTAL_STEPS = 2;
        this.currentStep = 1;
        this.wizardData = {
            name: '',
            email: '',
            username: '',
            password: ''
        };

        // Referencias a elementos DOM
        this.progressFill = document.getElementById('progressFill');
        this.stepIndicator = document.getElementById('stepIndicator');
        this.wizardContent = document.getElementById('wizardContent');
        this.backButton = document.getElementById('backButton');
        this.nextButton = document.getElementById('nextButton');
        this.navigation = document.getElementById('wizardNavigation');

        this.init();
    }

    init() {
        this.updateProgress();
        this.renderCurrentStep();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.backButton.addEventListener('click', () => this.goToPreviousStep());
        this.nextButton.addEventListener('click', () => this.goToNextStep());
    }

    updateProgress() {
        const percentage = (this.currentStep / this.TOTAL_STEPS) * 100;
        this.progressFill.style.width = `${percentage}%`;
        this.stepIndicator.textContent = `Paso ${this.currentStep} de ${this.TOTAL_STEPS}`;
    }

    renderCurrentStep() {
        let content = '';
        
        switch (this.currentStep) {
            case 1:
                content = this.renderBasicInfoStep();
                break;
            case 2:
                content = this.renderCompletionStep();
                break;
        }

        this.wizardContent.innerHTML = content;
        this.updateNavigation();
        this.setupStepEventListeners();
    }

    renderBasicInfoStep() {
        return `
            <div class="step-header">
                <h2 class="step-title">Crea tu cuenta</h2>
                <p class="step-description">
                    Completa los datos básicos para comenzar.
                </p>
            </div>
            <div class="step-content">
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">
                            Nombre completo *
                        </label>
                        <input 
                            type="text" 
                            id="nameInput" 
                            class="login-input" 
                            placeholder="Tu nombre completo"
                            value="${this.wizardData.name}"
                            required
                        >
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">
                            Email *
                        </label>
                        <input 
                            type="email" 
                            id="emailInput" 
                            class="login-input" 
                            placeholder="tu@email.com"
                            value="${this.wizardData.email}"
                            required
                        >
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">
                            Nombre de usuario *
                        </label>
                        <input 
                            type="text" 
                            id="usernameInput" 
                            class="login-input" 
                            placeholder="Elige un nombre de usuario único"
                            value="${this.wizardData.username}"
                            required
                        >
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">
                            Contraseña *
                        </label>
                        <input 
                            type="password" 
                            id="passwordInput" 
                            class="login-input" 
                            placeholder="Mínimo 6 caracteres"
                            value="${this.wizardData.password}"
                            required
                        >
                    </div>
                </div>
            </div>
        `;
    }

    renderCompletionStep() {
        return `
            <div class="step-header">
                <h2 class="step-title">¡Listo para crear tu cuenta!</h2>
                <p class="step-description">
                    Revisa tus datos y crea tu cuenta.
                </p>
            </div>
            <div class="step-content completion-content">
                <div class="summary-card">
                    <h3>Resumen de tu cuenta:</h3>
                    <p><strong>Nombre:</strong> ${this.wizardData.name}</p>
                    <p><strong>Email:</strong> ${this.wizardData.email}</p>
                    <p><strong>Username:</strong> ${this.wizardData.username}</p>
                </div>
                
                <div class="loading-animation">
                    <div class="loading-brain">🧠</div>
                    <p class="loading-text">Preparando tu cuenta...</p>
                </div>
            </div>
        `;
    }

    setupStepEventListeners() {
        if (this.currentStep === 1) {
            this.setupBasicInfoListeners();
        }
    }

    setupBasicInfoListeners() {
        const nameInput = document.getElementById('nameInput');
        const emailInput = document.getElementById('emailInput');
        const usernameInput = document.getElementById('usernameInput');
        const passwordInput = document.getElementById('passwordInput');

        nameInput.addEventListener('input', (e) => {
            this.wizardData.name = e.target.value;
        });

        emailInput.addEventListener('input', (e) => {
            this.wizardData.email = e.target.value;
        });

        usernameInput.addEventListener('input', (e) => {
            this.wizardData.username = e.target.value;
        });

        passwordInput.addEventListener('input', (e) => {
            this.wizardData.password = e.target.value;
        });
    }

    updateNavigation() {
        if (this.currentStep === 1) {
            this.backButton.style.display = 'none';
            this.nextButton.innerHTML = 'Continuar';
        } else if (this.currentStep === 2) {
            this.backButton.style.display = 'flex';
            this.nextButton.innerHTML = 'Crear Cuenta';
        }

        this.nextButton.disabled = !this.canProceed();
    }

    canProceed() {
        if (this.currentStep === 1) {
            return this.wizardData.name.trim().length > 0 && 
                   this.wizardData.email.trim().length > 0 && 
                   this.wizardData.username.trim().length > 0 && 
                   this.wizardData.password.length >= 6;
        }
        return true;
    }

    goToNextStep() {
        if (!this.canProceed()) return;

        if (this.currentStep === 2) {
            this.completeRegistration();
            return;
        }

        if (this.currentStep < this.TOTAL_STEPS) {
            this.currentStep++;
            this.updateProgress();
            this.renderCurrentStep();
        }
    }

    goToPreviousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateProgress();
            this.renderCurrentStep();
        }
    }

    async completeRegistration() {
        try {
            this.nextButton.disabled = true;
            this.nextButton.innerHTML = 'Creando cuenta...';

            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: this.wizardData.name,
                    email: this.wizardData.email,
                    username: this.wizardData.username,
                    password: this.wizardData.password
                })
            });

            const result = await response.json();

            if (result.success) {
                // Guardar datos del usuario
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('userData', JSON.stringify(result.data.user));

                // Mostrar mensaje de éxito
                this.showSuccessMessage('¡Cuenta creada exitosamente!');

                // Redirigir al dashboard después de un delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                throw new Error(result.message || 'Error al crear la cuenta');
            }

        } catch (error) {
            console.error('Error en registro:', error);
            this.showErrorMessage(error.message || 'Error al crear la cuenta');
            this.nextButton.disabled = false;
            this.nextButton.innerHTML = 'Crear Cuenta';
        }
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: #ef4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideInRight 0.5s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// ===== ESTILOS ADICIONALES =====
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
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
    
    .summary-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
    }
    
    .summary-card h3 {
        margin-bottom: 1rem;
        color: var(--text-primary);
    }
    
    .summary-card p {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }
    
    .loading-animation {
        text-align: center;
        margin-top: 2rem;
    }
    
    .loading-brain {
        font-size: 3rem;
        animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }
`;
document.head.appendChild(additionalStyles);

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario ya está autenticado
    const token = localStorage.getItem('authToken');
    if (token) {
        window.location.href = 'dashboard.html';
        return;
    }

    new RegisterWizard();
});
