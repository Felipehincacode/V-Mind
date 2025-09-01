// ===== WIZARD DE REGISTRO INMERSIVO =====

class RegisterWizard {
    constructor() {
        this.TOTAL_STEPS = 6;
        this.currentStep = 1;
        this.wizardData = {
            // Datos básicos de registro
            username: '',
            email: '',
            passwords: '',
            name: '',
            // Datos del wizard inmersivo
            intereses: [],
            nivel: 1,
            objetivo: '',
            ritmo: 'equilibrado'
        };

        // Referencias a elementos DOM
        this.progressFill = document.getElementById('progressFill');
        this.stepIndicator = document.getElementById('stepIndicator');
        this.wizardContent = document.getElementById('wizardContent');
        this.backButton = document.getElementById('backButton');
        this.nextButton = document.getElementById('nextButton');
        this.navigation = document.getElementById('wizardNavigation');

        // Datos de configuración
        this.interests = [
            { id: 'javascript', name: 'JavaScript', emoji: '⚡' },
            { id: 'python', name: 'Python', emoji: '🐍' },
            { id: 'uiux', name: 'UI/UX Design', emoji: '🎨' },
            { id: 'database', name: 'Bases de Datos', emoji: '🗄️' },
            { id: 'web', name: 'Desarrollo Web', emoji: '🌐' },
            { id: 'mobile', name: 'Apps Móviles', emoji: '📱' },
            { id: 'ai', name: 'Inteligencia Artificial', emoji: '🤖' },
            { id: 'data', name: 'Data Science', emoji: '📊' },
            { id: 'design', name: 'Diseño Gráfico', emoji: '🖌️' },
            { id: 'marketing', name: 'Marketing Digital', emoji: '📈' }
        ];

        this.levels = [
            { value: 1, label: 'Novato', emoji: '🌱', description: 'Estoy comenzando desde cero' },
            { value: 2, label: 'Principiante', emoji: '🌿', description: 'Tengo conocimientos básicos' },
            { value: 3, label: 'Intermedio', emoji: '🌳', description: 'Puedo trabajar independientemente' },
            { value: 4, label: 'Avanzado', emoji: '🚀', description: 'Tengo experiencia sólida' },
            { value: 5, label: 'Experto', emoji: '⭐', description: 'Domino el tema profundamente' }
        ];

        this.rhythms = [
            {
                id: 'rapido',
                name: 'Rápido',
                emoji: '🚀',
                description: 'Quiero avanzar rápidamente',
                timeCommitment: '2-3 horas diarias'
            },
            {
                id: 'equilibrado',
                name: 'Equilibrado',
                emoji: '⚖️',
                description: 'Un ritmo constante y sostenible',
                timeCommitment: '1-2 horas diarias'
            },
            {
                id: 'tranquilo',
                name: 'Tranquilo',
                emoji: '🌱',
                description: 'Prefiero tomarme mi tiempo',
                timeCommitment: '30-60 min diarios'
            }
        ];

        this.objectiveExamples = [
            "Construir mi primera app web en 2 meses",
            "Cambiar de carrera a desarrollo de software",
            "Mejorar mis habilidades de diseño UX",
            "Aprender Python para análisis de datos",
            "Crear un portafolio impresionante"
        ];

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
                content = this.renderWelcomeStep();
                break;
            case 2:
                content = this.renderBasicInfoStep();
                break;
            case 3:
                content = this.renderInterestsStep();
                break;
            case 4:
                content = this.renderLevelStep();
                break;
            case 5:
                content = this.renderObjectiveStep();
                break;
            case 6:
                content = this.renderRhythmStep();
                break;
            case 7:
                content = this.renderCompletionStep();
                break;
        }

        this.wizardContent.innerHTML = content;
        this.updateNavigation();
        this.setupStepEventListeners();
    }

    renderWelcomeStep() {
        return `
            <div class="step-header">
                <h2 class="step-title">Hola, soy Vmind</h2>
                <p class="step-description">
                    Tu asistente de aprendizaje personalizado. Vamos a crear juntos un plan de estudio que se adapte a ti.
                </p>
            </div>
            <div class="step-content">
                <p style="text-align: center; color: var(--text-muted); margin-bottom: 2rem;">
                    Te haré algunas preguntas para entender mejor cómo prefieres aprender y qué te interesa.
                </p>
            </div>
        `;
    }

    renderBasicInfoStep() {
        return `
            <div class="step-header">
                <h2 class="step-title">Primero, cuéntame sobre ti</h2>
                <p class="step-description">
                    Necesito algunos datos básicos para crear tu cuenta.
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

    renderInterestsStep() {
        return `
            <div class="step-header">
                <h2 class="step-title">¿Qué te interesa aprender?</h2>
                <p class="step-description">
                    Selecciona los temas que más te llamen la atención. Puedes elegir varios.
                </p>
            </div>
            <div class="step-content">
                <div class="interests-grid">
                    ${this.interests.map((interest, index) => `
                        <button 
                            class="interest-card ${this.wizardData.intereses.includes(interest.id) ? 'selected' : ''}"
                            data-interest="${interest.id}"
                            style="--delay: ${index}"
                        >
                            <span class="interest-emoji">${interest.emoji}</span>
                            <span class="interest-name">${interest.name}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="interests-counter ${this.wizardData.intereses.length > 0 ? 'visible' : ''}" id="interestsCounter">
                    <p class="interests-counter-text">
                        Has seleccionado ${this.wizardData.intereses.length} tema${this.wizardData.intereses.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        `;
    }

    renderLevelStep() {
        const currentLevel = this.levels.find(l => l.value === this.wizardData.nivel) || this.levels[0];
        
        return `
            <div class="step-header">
                <h2 class="step-title">¿Cuál es tu nivel actual?</h2>
                <p class="step-description">
                    Esto me ayuda a ajustar el contenido a tu experiencia.
                </p>
            </div>
            <div class="step-content">
                <div class="level-display animate">
                    <span class="level-emoji">${currentLevel.emoji}</span>
                    <h3 class="level-label">${currentLevel.label}</h3>
                    <p class="level-description">${currentLevel.description}</p>
                </div>

                <div class="level-slider" id="levelSlider">
                    <div class="level-slider-fill" id="levelSliderFill" style="width: ${(this.wizardData.nivel / 5) * 100}%">
                        <div class="level-slider-thumb" id="levelSliderThumb" style="left: ${(this.wizardData.nivel / 5) * 100}%"></div>
                    </div>
                </div>

                <div class="level-markers">
                    ${this.levels.map(level => `
                        <button 
                            class="level-marker ${this.wizardData.nivel === level.value ? 'active' : ''}"
                            data-level="${level.value}"
                        >
                            <span class="level-marker-emoji">${level.emoji}</span>
                            <span class="level-marker-label">${level.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderObjectiveStep() {
        return `
            <div class="step-header">
                <h2 class="step-title">¿Cuál es tu objetivo?</h2>
                <p class="step-description">
                    Cuéntame qué quieres lograr con tu aprendizaje.
                </p>
            </div>
            <div class="step-content">
                <div>
                    <textarea 
                        id="objectiveTextarea"
                        class="objective-textarea"
                        placeholder="Mi objetivo es..."
                        maxlength="200"
                    >${this.wizardData.objetivo}</textarea>
                    <div class="character-counter">
                        <span id="charCount">${this.wizardData.objetivo.length}</span>/200 caracteres
                    </div>
                </div>

                <div class="objective-examples">
                    <p class="objective-examples-title">Ejemplos de objetivos:</p>
                    ${this.objectiveExamples.map((example, index) => `
                        <button 
                            class="objective-example"
                            data-example="${example}"
                            style="--delay: ${index}"
                        >
                            "${example}"
                        </button>
                    `).join('')}
                </div>

                <div class="objective-feedback ${this.wizardData.objetivo.trim().length > 0 ? 'visible' : ''}" id="objectiveFeedback">
                    <p class="objective-feedback-text">
                        Perfecto, tu objetivo está claro y enfocado.
                    </p>
                </div>
            </div>
        `;
    }

    renderRhythmStep() {
        return `
            <div class="step-header">
                <h2 class="step-title">¿A qué ritmo prefieres aprender?</h2>
                <p class="step-description">
                    Esto me ayuda a ajustar la carga de trabajo.
                </p>
            </div>
            <div class="step-content">
                <div class="rhythm-options">
                    ${this.rhythms.map((rhythm, index) => `
                        <button 
                            class="rhythm-card ${this.wizardData.ritmo === rhythm.id ? 'selected' : ''}"
                            data-rhythm="${rhythm.id}"
                            style="--delay: ${index}"
                        >
                            <div class="rhythm-emoji">${rhythm.emoji}</div>
                            <div class="rhythm-content">
                                <h3 class="rhythm-name">${rhythm.name}</h3>
                                <p class="rhythm-description">${rhythm.description}</p>
                                <div class="rhythm-commitment">
                                    ⏰ ${rhythm.timeCommitment}
                                </div>
                            </div>
                            <div class="rhythm-check">✓</div>
                        </button>
                    `).join('')}
                </div>

                <div class="rhythm-tip">
                    <p class="rhythm-tip-text">
                        <strong>Nota:</strong> Puedes cambiar tu ritmo de aprendizaje en cualquier momento desde tu perfil.
                    </p>
                </div>
            </div>
        `;
    }

    renderCompletionStep() {
        const currentLevel = this.levels.find(l => l.value === this.wizardData.nivel) || this.levels[0];
        const currentRhythm = this.rhythms.find(r => r.id === this.wizardData.ritmo) || this.rhythms[1];
        
        return `
            <div class="step-header">
                <h2 class="step-title">Perfecto, tu plan está listo</h2>
                <p class="step-description">
                    He creado un plan de aprendizaje personalizado para ti
                </p>
            </div>
            <div class="step-content completion-content">
                <div class="completion-summary">
                    <div class="summary-card">
                        <span class="summary-emoji">${currentLevel.emoji}</span>
                        <p class="summary-label">Nivel ${this.wizardData.nivel}</p>
                    </div>
                    <div class="summary-card">
                        <span class="summary-emoji">${currentRhythm.emoji}</span>
                        <p class="summary-label">${currentRhythm.name}</p>
                    </div>
                </div>

                <div class="interests-preview">
                    <p class="preview-title">Temas de interés:</p>
                    <div class="interests-tags">
                        ${this.wizardData.intereses.map(interestId => {
                            const interest = this.interests.find(i => i.id === interestId);
                            return `<span class="interest-tag">${interest ? interest.name : interestId}</span>`;
                        }).join('')}
                    </div>
                </div>

                <div class="objective-preview">
                    <p class="preview-title">Tu objetivo:</p>
                    <p class="objective-text">"${this.wizardData.objetivo}"</p>
                </div>

                <div class="loading-animation">
                    <div class="loading-brain">⚡</div>
                    <p class="loading-text">Preparando tu plan de aprendizaje...</p>
                </div>
            </div>
        `;
    }

    setupStepEventListeners() {
        switch (this.currentStep) {
            case 2:
                this.setupBasicInfoListeners();
                break;
            case 3:
                this.setupInterestsListeners();
                break;
            case 4:
                this.setupLevelListeners();
                break;
            case 5:
                this.setupObjectiveListeners();
                break;
            case 6:
                this.setupRhythmListeners();
                break;
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
            this.wizardData.passwords = e.target.value;
        });
    }

    setupInterestsListeners() {
        const interestCards = document.querySelectorAll('.interest-card');
        
        interestCards.forEach(card => {
            card.addEventListener('click', () => {
                const interestId = card.dataset.interest;
                this.toggleInterest(interestId);
                card.classList.toggle('selected');
                this.updateInterestsCounter();
            });
        });
    }

    setupLevelListeners() {
        const levelMarkers = document.querySelectorAll('.level-marker');
        const slider = document.getElementById('levelSlider');
        
        levelMarkers.forEach(marker => {
            marker.addEventListener('click', () => {
                const level = parseInt(marker.dataset.level);
                this.updateLevel(level);
            });
        });

        // Implementar slider interactivo
        slider.addEventListener('click', (e) => {
            const rect = slider.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            const level = Math.max(1, Math.min(5, Math.round(percentage * 5)));
            this.updateLevel(level);
        });
    }

    setupObjectiveListeners() {
        const textarea = document.getElementById('objectiveTextarea');
        const charCount = document.getElementById('charCount');
        const examples = document.querySelectorAll('.objective-example');
        const feedback = document.getElementById('objectiveFeedback');

        textarea.addEventListener('input', (e) => {
            this.wizardData.objetivo = e.target.value;
            charCount.textContent = e.target.value.length;
            
            if (e.target.value.trim().length > 0) {
                feedback.classList.add('visible');
            } else {
                feedback.classList.remove('visible');
            }
        });

        examples.forEach(example => {
            example.addEventListener('click', () => {
                const exampleText = example.dataset.example;
                textarea.value = exampleText;
                this.wizardData.objetivo = exampleText;
                charCount.textContent = exampleText.length;
                feedback.classList.add('visible');
            });
        });
    }

    setupRhythmListeners() {
        const rhythmCards = document.querySelectorAll('.rhythm-card');
        
        rhythmCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remover selección anterior
                rhythmCards.forEach(c => c.classList.remove('selected'));
                // Agregar selección actual
                card.classList.add('selected');
                // Actualizar datos
                this.wizardData.ritmo = card.dataset.rhythm;
            });
        });
    }

    toggleInterest(interestId) {
        const index = this.wizardData.intereses.indexOf(interestId);
        if (index > -1) {
            this.wizardData.intereses.splice(index, 1);
        } else {
            this.wizardData.intereses.push(interestId);
        }
    }

    updateInterestsCounter() {
        const counter = document.getElementById('interestsCounter');
        const count = this.wizardData.intereses.length;
        
        if (count > 0) {
            counter.classList.add('visible');
            counter.querySelector('.interests-counter-text').textContent = 
                `Has seleccionado ${count} tema${count !== 1 ? 's' : ''}`;
        } else {
            counter.classList.remove('visible');
        }
    }

    updateLevel(level) {
        this.wizardData.nivel = level;
        
        // Actualizar display
        const currentLevel = this.levels.find(l => l.value === level);
        const display = document.querySelector('.level-display');
        display.innerHTML = `
            <span class="level-emoji">${currentLevel.emoji}</span>
            <h3 class="level-label">${currentLevel.label}</h3>
            <p class="level-description">${currentLevel.description}</p>
        `;

        // Actualizar slider
        const percentage = (level / 5) * 100;
        document.getElementById('levelSliderFill').style.width = `${percentage}%`;
        document.getElementById('levelSliderThumb').style.left = `${percentage}%`;

        // Actualizar marcadores
        document.querySelectorAll('.level-marker').forEach(marker => {
            marker.classList.toggle('active', parseInt(marker.dataset.level) === level);
        });
    }

    updateNavigation() {
        // Mostrar/ocultar botón de atrás y ajustar layout
        if (this.currentStep > 1 && this.currentStep < 7) {
            this.backButton.style.display = 'flex';
            this.navigation.classList.add('has-back');
        } else {
            this.backButton.style.display = 'none';
            this.navigation.classList.remove('has-back');
        }

        // Actualizar botón de siguiente
        if (this.currentStep === 7) {
            this.nextButton.className = 'wizard-nav-button complete';
            this.nextButton.innerHTML = 'Ver mi plan<div class="button-glow"></div>';
        } else if (this.currentStep === 1) {
            this.nextButton.className = 'wizard-nav-button next';
            this.nextButton.innerHTML = '<span>Comenzar</span><div class="button-glow"></div>';
        } else {
            this.nextButton.className = 'wizard-nav-button next';
            this.nextButton.innerHTML = '<span>Continuar</span><div class="button-glow"></div>';
        }

        // Habilitar/deshabilitar botón según validación
        this.nextButton.disabled = !this.canProceed();
    }

    canProceed() {
        switch (this.currentStep) {
            case 1: return true; // Welcome screen
            case 2: 
                return this.wizardData.name.trim().length > 0 && 
                       this.wizardData.email.trim().length > 0 && 
                       this.wizardData.username.trim().length > 0 && 
                       this.wizardData.passwords.length >= 6;
            case 3: return this.wizardData.intereses.length > 0;
            case 4: return true; // Level is always valid
            case 5: return this.wizardData.objetivo.trim().length > 0;
            case 6: return true; // Rhythm is always selected
            case 7: return true; // Complete screen
            default: return false;
        }
    }

    goToNextStep() {
        if (!this.canProceed()) return;

        if (this.currentStep === 7) {
            this.completeRegistration();
            return;
        }

        if (this.currentStep < 7) {
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
            this.nextButton.innerHTML = '<div style="display: inline-block; animation: spin 1s linear infinite;">🧠</div> Creando tu cuenta...';

            // Llamar a la API de registro real
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: this.wizardData.name,
                    email: this.wizardData.email,
                    username: this.wizardData.username,
                    passwords: this.wizardData.passwords,
                    objetive: this.wizardData.objetivo,
                    preferred_language: 'es'
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
            this.handleRegistrationError(error);
        }
    }

    handleRegistrationError(error) {
        this.nextButton.disabled = false;
        this.nextButton.innerHTML = '¡Ver mi roadmap! 🗺️';

        let message = 'Error al crear la cuenta. Intenta de nuevo.';
        
        if (error instanceof ApiError) {
            message = error.message;
            
            // Si hay errores de validación específicos, volver al paso 2
            if (error.status === 422 && error.data.errors) {
                this.currentStep = 2;
                this.updateProgress();
                this.renderCurrentStep();
                this.showValidationErrors(error.data.errors);
                return;
            }
        }

        this.showErrorMessage(message);
    }

    showValidationErrors(errors) {
        // Implementar mostrar errores específicos en los campos
        setTimeout(() => {
            for (const [field, messages] of Object.entries(errors)) {
                const message = Array.isArray(messages) ? messages[0] : messages;
                
                if (field === 'email') {
                    this.showFieldError('emailInput', message);
                } else if (field === 'username') {
                    this.showFieldError('usernameInput', message);
                } else if (field === 'passwords') {
                    this.showFieldError('passwordInput', message);
                }
            }
        }, 100);
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = 'var(--error)';
            field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
            
            // Crear mensaje de error si no existe
            let errorMsg = field.parentNode.querySelector('.field-error');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'field-error';
                errorMsg.style.cssText = `
                    color: var(--error);
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                `;
                field.parentNode.appendChild(errorMsg);
            }
            errorMsg.textContent = message;

            // Limpiar error cuando el usuario empiece a escribir
            field.addEventListener('input', () => {
                field.style.borderColor = '';
                field.style.boxShadow = '';
                if (errorMsg) errorMsg.remove();
            }, { once: true });
        }
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
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

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
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
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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

// ===== ACTUALIZAR API CONFIG PARA REGISTRO =====
// Extender el cliente API si no tiene el método register
if (window.apiClient && !window.apiClient.register) {
    window.apiClient.register = async function(userData) {
        return this.makeRequest('register', {
            method: 'POST',
            body: userData
        });
    };
}
