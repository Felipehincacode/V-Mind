// ===== DASHBOARD CON NAVEGACIÓN POR SCROLL STICKY =====

import { apiService, ApiError } from './services/api.js';
import { getConfig } from './config.js';

class Dashboard {
    constructor() {
        this.currentSection = 'home';
        this.sections = ['home', 'roadmap', 'notas', 'recursos'];
        this.quotes = [
            { text: "El aprendizaje es un tesoro que seguirá a su dueño a todas partes.", author: "Proverbio chino" },
            { text: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.", author: "Nelson Mandela" },
            { text: "El conocimiento es poder, pero la práctica es la clave del dominio.", author: "Confucio" },
            { text: "Cada día es una nueva oportunidad para aprender algo nuevo.", author: "Desconocido" },
            { text: "La mente que se abre a una nueva idea nunca vuelve a su tamaño original.", author: "Albert Einstein" }
        ];
        this.notes = [];
        this.resources = [];
        this.roadmaps = [];
        this.userData = null;
        this.userStats = null;
        this.charts = {};
        this.quillEditor = null;
        this.resourceQuillEditor = null;
        
        // Variables del slider
        this.currentPlanetIndex = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartScrollLeft = 0;
        
        // Variable para rastrear tareas marcadas en la sesión actual del modal
        this.tasksMarkedInCurrentSession = 0;
        
        // Contador para el easter egg (después de 5 warnings)
        this.warningCount = 0;
        
        // Datos del roadmap de Python con tareas
        this.pythonRoadmap = {
            fundamentals: {
                name: "Fundamentos de Python",
                description: "Los cimientos de tu viaje de programación",
                status: "unlocked",
                tasks: [
                    { id: 1, title: "Crear tu primer programa 'Hola Mundo'", description: "Escribe y ejecuta tu primer código Python", xp: 50, completed: false },
                    { id: 2, title: "Aprender sobre variables", description: "Entiende cómo crear y usar variables", xp: 75, completed: false },
                    { id: 3, title: "Practicar con tipos de datos", description: "Trabaja con strings, números y booleanos", xp: 100, completed: false },
                    { id: 4, title: "Usar operadores básicos", description: "Aprende operadores aritméticos y lógicos", xp: 75, completed: false },
                    { id: 5, title: "Crear tu primer proyecto", description: "Combina todo lo aprendido en un proyecto", xp: 150, completed: false }
                ],
                resources: [
                    "Video: Introducción a Python",
                    "Documentación oficial de Python",
                    "Ejercicios prácticos interactivos",
                    "Quiz de fundamentos"
                ]
            },
            "control-flow": {
                name: "Control de Flujo",
                description: "Aprende a controlar el flujo de tu programa",
                status: "locked",
                tasks: [
                    { id: 1, title: "Usar condicionales if/else", description: "Aprende a tomar decisiones en tu código", xp: 100, completed: false },
                    { id: 2, title: "Implementar bucles for", description: "Repite acciones con bucles", xp: 125, completed: false },
                    { id: 3, title: "Trabajar con bucles while", description: "Bucles con condición de parada", xp: 125, completed: false },
                    { id: 4, title: "Crear funciones básicas", description: "Organiza tu código en funciones", xp: 150, completed: false },
                    { id: 5, title: "Proyecto: Calculadora", description: "Crea una calculadora usando control de flujo", xp: 200, completed: false }
                ],
                resources: [
                    "Video: Control de flujo en Python",
                    "Tutorial interactivo de funciones",
                    "Ejercicios de lógica de programación",
                    "Proyecto: Calculadora básica"
                ]
            },
            "data-structures": {
                name: "Estructuras de Datos",
                description: "Organiza y manipula datos eficientemente",
                status: "locked",
                tasks: [
                    { id: 1, title: "Trabajar con listas", description: "Aprende a crear y manipular listas", xp: 100, completed: false },
                    { id: 2, title: "Usar tuplas", description: "Entiende las tuplas y sus características", xp: 75, completed: false },
                    { id: 3, title: "Crear diccionarios", description: "Organiza datos con pares clave-valor", xp: 125, completed: false },
                    { id: 4, title: "Operaciones con sets", description: "Trabaja con conjuntos únicos", xp: 100, completed: false },
                    { id: 5, title: "Comprensión de listas", description: "Optimiza tu código con comprensiones", xp: 150, completed: false }
                ],
                resources: [
                    "Video: Estructuras de datos en Python",
                    "Guía completa de diccionarios",
                    "Ejercicios de manipulación de datos",
                    "Proyecto: Sistema de inventario"
                ]
            },
            "functions": {
                name: "Funciones Avanzadas",
                description: "Domina las funciones y técnicas avanzadas",
                status: "locked",
                tasks: [
                    { id: 1, title: "Crear funciones lambda", description: "Funciones anónimas para operaciones simples", xp: 100, completed: false },
                    { id: 2, title: "Implementar decoradores", description: "Modifica funciones con decoradores", xp: 150, completed: false },
                    { id: 3, title: "Trabajar con generadores", description: "Crea iteradores eficientes", xp: 125, completed: false },
                    { id: 4, title: "Funciones recursivas", description: "Funciones que se llaman a sí mismas", xp: 150, completed: false },
                    { id: 5, title: "Args y kwargs", description: "Funciones con argumentos variables", xp: 125, completed: false }
                ],
                resources: [
                    "Video: Funciones avanzadas",
                    "Tutorial de decoradores",
                    "Guía de generadores",
                    "Proyecto: Framework de decoradores"
                ]
            },
            "oop": {
                name: "Programación Orientada a Objetos",
                description: "Organiza tu código con clases y objetos",
                status: "locked",
                tasks: [
                    { id: 1, title: "Crear clases básicas", description: "Define tus primeras clases", xp: 150, completed: false },
                    { id: 2, title: "Implementar herencia", description: "Reutiliza código con herencia", xp: 175, completed: false },
                    { id: 3, title: "Usar métodos especiales", description: "Personaliza el comportamiento de objetos", xp: 150, completed: false },
                    { id: 4, title: "Encapsulación", description: "Protege datos con encapsulación", xp: 125, completed: false },
                    { id: 5, title: "Proyecto: Sistema de biblioteca", description: "Crea un sistema completo con POO", xp: 250, completed: false }
                ],
                resources: [
                    "Video: POO en Python",
                    "Tutorial de clases y objetos",
                    "Guía de herencia",
                    "Proyecto: Sistema de gestión de biblioteca"
                ]
            },
            "modules": {
                name: "Módulos y Paquetes",
                description: "Organiza y reutiliza tu código",
                status: "locked",
                tasks: [
                    { id: 1, title: "Importar módulos", description: "Usa módulos de la biblioteca estándar", xp: 75, completed: false },
                    { id: 2, title: "Crear módulos propios", description: "Organiza tu código en módulos", xp: 100, completed: false },
                    { id: 3, title: "Trabajar con paquetes", description: "Estructura proyectos complejos", xp: 125, completed: false },
                    { id: 4, title: "Instalar paquetes externos", description: "Usa pip para instalar librerías", xp: 75, completed: false },
                    { id: 5, title: "Entornos virtuales", description: "Aísla dependencias de proyectos", xp: 100, completed: false }
                ],
                resources: [
                    "Video: Módulos y paquetes",
                    "Guía de pip y PyPI",
                    "Tutorial de entornos virtuales",
                    "Proyecto: Paquete personalizado"
                ]
            },
            "exceptions": {
                name: "Manejo de Excepciones",
                description: "Escribe código robusto y maneja errores",
                status: "locked",
                tasks: [
                    { id: 1, title: "Try/except básico", description: "Captura y maneja errores", xp: 100, completed: false },
                    { id: 2, title: "Tipos de excepciones", description: "Conoce las excepciones más comunes", xp: 75, completed: false },
                    { id: 3, title: "Context managers", description: "Usa with para manejo de recursos", xp: 125, completed: false },
                    { id: 4, title: "Excepciones personalizadas", description: "Crea tus propias excepciones", xp: 100, completed: false },
                    { id: 5, title: "Logging", description: "Registra eventos y errores", xp: 125, completed: false }
                ],
                resources: [
                    "Video: Manejo de excepciones",
                    "Guía de context managers",
                    "Tutorial de logging",
                    "Proyecto: Sistema de logging"
                ]
            },
            "file-io": {
                name: "Archivos y I/O",
                description: "Lee y escribe datos en archivos",
                status: "locked",
                tasks: [
                    { id: 1, title: "Leer archivos de texto", description: "Abre y lee archivos", xp: 100, completed: false },
                    { id: 2, title: "Escribir archivos", description: "Crea y modifica archivos", xp: 100, completed: false },
                    { id: 3, title: "Trabajar con CSV", description: "Procesa datos tabulares", xp: 125, completed: false },
                    { id: 4, title: "Serialización JSON", description: "Guarda y carga datos estructurados", xp: 100, completed: false },
                    { id: 5, title: "Proyecto: Gestor de archivos", description: "Crea una aplicación de gestión de archivos", xp: 200, completed: false }
                ],
                resources: [
                    "Video: Archivos y I/O",
                    "Guía de CSV en Python",
                    "Tutorial de JSON",
                    "Proyecto: Gestor de archivos"
                ]
            },
            "web": {
                name: "Desarrollo Web",
                description: "Crea aplicaciones web con Python",
                status: "locked",
                tasks: [
                    { id: 1, title: "Primera app con Flask", description: "Crea tu primera aplicación web", xp: 150, completed: false },
                    { id: 2, title: "Rutas y templates", description: "Define rutas y crea vistas", xp: 125, completed: false },
                    { id: 3, title: "APIs REST", description: "Crea APIs para comunicación", xp: 175, completed: false },
                    { id: 4, title: "Bases de datos web", description: "Conecta tu app con una base de datos", xp: 150, completed: false },
                    { id: 5, title: "Despliegue", description: "Publica tu aplicación en la web", xp: 200, completed: false }
                ],
                resources: [
                    "Video: Desarrollo web con Python",
                    "Tutorial de Flask",
                    "Guía de Django",
                    "Proyecto: Blog web"
                ]
            },
            "data-science": {
                name: "Data Science",
                description: "Analiza y visualiza datos",
                status: "locked",
                tasks: [
                    { id: 1, title: "Introducción a Pandas", description: "Manipula datos con DataFrames", xp: 150, completed: false },
                    { id: 2, title: "Análisis básico", description: "Explora y limpia datos", xp: 125, completed: false },
                    { id: 3, title: "Visualización con Matplotlib", description: "Crea gráficos y visualizaciones", xp: 150, completed: false },
                    { id: 4, title: "Jupyter Notebooks", description: "Trabaja en notebooks interactivos", xp: 100, completed: false },
                    { id: 5, title: "Proyecto: Análisis de datos", description: "Realiza un análisis completo de datos", xp: 250, completed: false }
                ],
                resources: [
                    "Video: Data Science con Python",
                    "Tutorial de Pandas",
                    "Guía de Matplotlib",
                    "Proyecto: Análisis de datos"
                ]
            }
        };
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.initializeScrollNavigation();
        this.renderDashboard();
        this.initializeCharts();
        this.loadNotes();
        this.loadResources();
        this.setupQuillEditor();
        this.setupResourceQuillEditor();
        this.loadRoadmapProgress();
        this.renderRoadmap();
        this.setupDragAndDrop();
        
        // Asegurar que el roadmap se inicialice correctamente después de que todo esté listo
        setTimeout(() => {
            this.initializeRoadmap();
        }, 500);
    }

    async loadUserData() {
        try {
            // Verificar si hay token
            const token = apiService.getAuthToken();
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            // Cargar datos del usuario desde la API
            const profileResponse = await apiService.getProfile();
            if (profileResponse.success) {
                this.userData = profileResponse.data.user;
                
                // Cargar estadísticas del usuario
                await this.loadUserStats();
                
                // Cargar datos adicionales
                await this.loadDashboardData();
                
                this.updateUserInterface();
            } else {
                throw new Error('Error cargando perfil de usuario');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            if (error instanceof ApiError && error.isAuthError()) {
                // Token expirado o inválido
                apiService.removeAuthToken();
                window.location.href = 'login.html';
            } else {
                this.showError('Error cargando datos del usuario');
            }
        }
    }

    async loadUserStats() {
        try {
            const statsResponse = await apiService.getUserStats();
            if (statsResponse.success) {
                this.userStats = statsResponse.data;
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    async loadDashboardData() {
        try {
            // Cargar roadmaps del usuario
            const roadmapsResponse = await apiService.getUserRoadmaps();
            if (roadmapsResponse.success) {
                this.roadmaps = roadmapsResponse.data;
            }

            // Cargar notas del usuario
            const notesResponse = await apiService.getNotes();
            if (notesResponse.success) {
                this.notes = notesResponse.data;
            }

            // Cargar recursos del usuario
            const resourcesResponse = await apiService.getResources();
            if (resourcesResponse.success) {
                this.resources = resourcesResponse.data;
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateUserInterface() {
        if (!this.userData) return;

        // Actualizar sidebar
        document.getElementById('sidebarUserName').textContent = this.userData.user_name || 'Usuario';
        document.getElementById('sidebarAvatar').src = 'assets/ui_elements/avatar.png';
        
        // Actualizar XP si hay estadísticas
        if (this.userStats) {
            const currentXP = this.userStats.user.current_level || 0;
            const nextLevelXP = this.getNextLevelXP(currentXP);
            const progressPercentage = ((currentXP % 1000) / 1000) * 100;
            
            document.getElementById('sidebarXPFill').style.width = `${progressPercentage}%`;
            document.getElementById('sidebarXP').textContent = currentXP.toLocaleString();
            document.getElementById('sidebarXPNext').textContent = nextLevelXP.toLocaleString();
        }

        // Actualizar home
        document.getElementById('userName').textContent = this.userData.user_name || 'Usuario';
        
        // Actualizar cita inspiradora
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        document.getElementById('quoteText').textContent = randomQuote.text;
        document.getElementById('quoteAuthor').textContent = `- ${randomQuote.author}`;

        // Actualizar streak si hay estadísticas
        if (this.userStats) {
            this.updateStreakDisplay();
        }

        // Renderizar roadmaps si están disponibles
        if (this.roadmaps.length > 0) {
            this.renderRoadmaps();
        }

        // Renderizar notas si están disponibles
        if (this.notes.length > 0) {
            this.renderNotes();
        }

        // Renderizar recursos si están disponibles
        if (this.resources.length > 0) {
            this.renderResources();
        }
    }

    getNextLevelXP(currentXP) {
        const level = Math.floor(currentXP / 1000) + 1;
        return level * 1000;
    }

    updateStreakDisplay() {
        const streakDays = document.querySelectorAll('.streak-day-mini');
        const currentStreak = this.userStats?.streak?.current_streak_days || 0;
        
        streakDays.forEach((day, index) => {
            if (index < currentStreak) {
                day.classList.add('active');
            } else {
                day.classList.remove('active');
            }
        });
    }

    setupEventListeners() {
        // Toggle de la tarjeta de perfil
        document.getElementById('profileCardHeader').addEventListener('click', () => {
            this.toggleProfileCard();
        });

        // Navegación por scroll
        document.querySelectorAll('.scroll-nav .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.scrollToSection(section);
            });
        });

        // Indicadores de scroll
        document.querySelectorAll('.scroll-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const sectionIndex = parseInt(e.currentTarget.dataset.section);
                this.scrollToSectionByIndex(sectionIndex);
            });
        });

        // Controles del slider
        const prevBtn = document.getElementById('prevPlanet');
        const nextBtn = document.getElementById('nextPlanet');
        
        console.log('Setting up slider controls:', prevBtn, nextBtn);
        
        prevBtn.addEventListener('click', () => {
            console.log('Prev button clicked');
            this.navigatePlanet(-1);
        });

        nextBtn.addEventListener('click', () => {
            console.log('Next button clicked');
            this.navigatePlanet(1);
        });

        // Botones de notas
        document.getElementById('newNoteBtn').addEventListener('click', () => {
            this.openNoteModal();
        });

        document.getElementById('newQuickNote').addEventListener('click', () => {
            this.openNoteModal();
        });

        // Modal de notas
        document.getElementById('closeNoteModal').addEventListener('click', () => {
            this.closeNoteModal();
        });

        document.getElementById('cancelNote').addEventListener('click', () => {
            this.closeNoteModal();
        });

        document.getElementById('saveNote').addEventListener('click', () => {
            this.saveNote();
        });

        // Modal de recursos
        document.getElementById('closeResourceModal').addEventListener('click', () => {
            this.closeResourceModal();
        });

        // Modal de planetas
        document.getElementById('closePlanetModal').addEventListener('click', () => {
            this.closePlanetModal();
        });

        document.getElementById('closePlanetBtn').addEventListener('click', () => {
            this.closePlanetModal();
        });

        document.getElementById('startPlanetBtn').addEventListener('click', () => {
            this.startPlanetLearning();
        });

        // Cerrar sesión
        document.getElementById('sidebarLogoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Event listeners para modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeNoteModal();
                this.closeResourceModal();
                this.closePlanetModal();
            }
        });

        // Listener para resize de ventana
        window.addEventListener('resize', () => {
            // Reajustar el roadmap cuando cambie el tamaño de la ventana
            setTimeout(() => {
                this.scrollToPlanet(this.currentPlanetIndex);
            }, 100);
        });
    }

    initializeScrollNavigation() {
        const main = document.querySelector('.dashboard-main');
        let isScrolling = false;

        main.addEventListener('scroll', () => {
            if (isScrolling) return;
            
            isScrolling = true;
            setTimeout(() => {
                isScrolling = false;
            }, 100);

            this.updateActiveSection();
        });

        // Scroll suave entre secciones
        this.setupSmoothScroll();
    }

    setupSmoothScroll() {
        const main = document.querySelector('.dashboard-main');
        main.style.scrollBehavior = 'smooth';
    }

    updateActiveSection() {
        const main = document.querySelector('.dashboard-main');
        const scrollTop = main.scrollTop;
        const sectionHeight = window.innerHeight;
        const currentIndex = Math.floor(scrollTop / sectionHeight);
        
        const newSection = this.sections[currentIndex] || 'home';
        
        if (newSection !== this.currentSection) {
            this.currentSection = newSection;
            this.updateNavigation();
            this.updateScrollIndicators(currentIndex);
        }
    }

    updateNavigation() {
        document.querySelectorAll('.scroll-nav .nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    updateScrollIndicators(activeIndex) {
        document.querySelectorAll('.scroll-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    scrollToSection(section) {
        const sectionIndex = this.sections.indexOf(section);
        if (sectionIndex === -1) return;

        this.scrollToSectionByIndex(sectionIndex);
    }

    scrollToSectionByIndex(index) {
        const main = document.querySelector('.dashboard-main');
        const sectionHeight = window.innerHeight;
        const targetScroll = index * sectionHeight;

        main.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

        this.currentSection = this.sections[index];
        this.updateNavigation();
        this.updateScrollIndicators(index);
    }

    toggleProfileCard() {
        const profileCardTop = document.getElementById('profileCardTop');
        profileCardTop.classList.toggle('expanded');
    }

    initializeCharts() {
        this.initializeProgressChart();
        this.initializeStreakChart();
    }

    initializeProgressChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        this.charts.progress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completado', 'Pendiente'],
                datasets: [{
                    data: [1, 9],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(255, 255, 255, 0.1)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(255, 255, 255, 0.2)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });
    }

    initializeStreakChart() {
        const ctx = document.getElementById('streakChart').getContext('2d');
        
        this.charts.streak = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Horas de estudio',
                    data: [2, 3, 1, 4, 2, 3, 1],
                    borderColor: 'rgba(255, 110, 199, 1)',
                    backgroundColor: 'rgba(255, 110, 199, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    renderRoadmap() {
        const sliderTrack = document.getElementById('sliderTrack');
        const planetOrder = ['fundamentals', 'control-flow', 'data-structures', 'functions', 'oop', 'modules', 'exceptions', 'file-io', 'web', 'data-science'];
        
        sliderTrack.innerHTML = '';
        
        planetOrder.forEach((planetId, index) => {
            const planetData = this.pythonRoadmap[planetId];
            const planetCard = document.createElement('div');
            planetCard.className = `planet-card ${planetData.status}`;
            planetCard.dataset.planet = planetId;
            planetCard.dataset.index = index;
            planetCard.draggable = true;
            
            planetCard.innerHTML = `
                <div class="planet-image">
                    <img src="assets/ui_elements/planeta${(index % 4) + 1}.png" alt="${planetData.name}">
                </div>
                <div class="planet-info">
                    <h3>${planetData.name}</h3>
                    <p>${planetData.description}</p>
                </div>
                <div class="planet-status">
                    ${this.getStatusIcon(planetData.status)}
                </div>
            `;
            
            planetCard.addEventListener('click', () => {
                if (planetData.status === 'unlocked' || planetData.status === 'completed') {
                    this.openPlanetModal(planetId);
                }
            });
            
            sliderTrack.appendChild(planetCard);
        });
        
        this.updateRoadmapProgress();
        this.updateSliderControls();
        
        // Debug: verificar que los planetas se renderizaron
        console.log('Planets rendered:', document.querySelectorAll('.planet-card').length);
    }

    initializeRoadmap() {
        // Asegurar que el primer planeta esté centrado y visible
        this.currentPlanetIndex = 0;
        
        // Forzar la posición inicial sin transform para asegurar visibilidad
        const sliderTrack = document.getElementById('sliderTrack');
        const sliderContainer = document.querySelector('.slider-container');
        
        // Debug: verificar que los elementos existen
        console.log('Slider elements:', {
            sliderTrack: !!sliderTrack,
            sliderContainer: !!sliderContainer,
            containerWidth: sliderContainer?.clientWidth,
            trackWidth: sliderTrack?.scrollWidth
        });
        
        sliderTrack.style.transform = 'translateX(0px)';
        
        // Esperar un momento y luego aplicar el centrado
        setTimeout(() => {
            this.scrollToPlanet(0);
            this.updateSliderControls();
            console.log('Roadmap initialized successfully');
        }, 100);
    }

    getStatusIcon(status) {
        switch (status) {
            case 'completed': return '✓';
            case 'unlocked': return '🔓';
            case 'locked': return '🔒';
            default: return '⏳';
        }
    }

    updateRoadmapProgress() {
        const planetOrder = ['fundamentals', 'control-flow', 'data-structures', 'functions', 'oop', 'modules', 'exceptions', 'file-io', 'web', 'data-science'];
        const completedPlanets = planetOrder.filter(planetId => this.pythonRoadmap[planetId].status === 'completed').length;
        const unlockedPlanets = planetOrder.filter(planetId => this.pythonRoadmap[planetId].status === 'unlocked').length;
        const progressPercentage = ((completedPlanets + unlockedPlanets * 0.3) / planetOrder.length) * 100;
        
        document.getElementById('roadmapProgress').style.width = `${progressPercentage}%`;
        document.getElementById('progressText').textContent = `${completedPlanets} completados, ${unlockedPlanets} desbloqueados de ${planetOrder.length} planetas`;
    }

    updateSliderControls() {
        const prevBtn = document.getElementById('prevPlanet');
        const nextBtn = document.getElementById('nextPlanet');
        
        // Habilitar/deshabilitar botones basado en el índice actual
        prevBtn.disabled = this.currentPlanetIndex === 0;
        nextBtn.disabled = this.currentPlanetIndex === 9;
        
        // Agregar clases visuales para el estado disabled
        prevBtn.classList.toggle('disabled', this.currentPlanetIndex === 0);
        nextBtn.classList.toggle('disabled', this.currentPlanetIndex === 9);
    }

    navigatePlanet(direction) {
        console.log('navigatePlanet called with direction:', direction, 'currentIndex:', this.currentPlanetIndex);
        const newIndex = this.currentPlanetIndex + direction;
        if (newIndex >= 0 && newIndex <= 9) {
            this.currentPlanetIndex = newIndex;
            this.scrollToPlanet(newIndex);
            this.updateSliderControls();
        }
    }

    scrollToPlanet(index) {
        const sliderTrack = document.getElementById('sliderTrack');
        const sliderContainer = document.querySelector('.slider-container');
        const cardWidth = 200; // Ancho de cada tarjeta
        const gap = 32; // Gap entre tarjetas
        const totalCardWidth = cardWidth + gap;
        const containerWidth = sliderContainer.clientWidth;
        
        // Asegurar que el índice esté dentro del rango válido
        const clampedIndex = Math.max(0, Math.min(9, index));
        
        // Calcular la posición para centrar el planeta
        const targetPosition = clampedIndex * totalCardWidth;
        const centerOffset = (containerWidth - cardWidth) / 2;
        const finalPosition = targetPosition - centerOffset;
        
        // Calcular el máximo scroll posible
        const totalWidth = 10 * totalCardWidth;
        const maxScroll = Math.max(0, totalWidth - containerWidth);
        const clampedPosition = Math.max(0, Math.min(maxScroll, finalPosition));
        
        console.log('scrollToPlanet:', {
            index: clampedIndex,
            containerWidth,
            targetPosition,
            centerOffset,
            finalPosition: clampedPosition,
            maxScroll
        });
        
        // Aplicar la transformación
        sliderTrack.style.transform = `translateX(-${clampedPosition}px)`;
        this.currentPlanetIndex = clampedIndex;
        
        // Actualizar la clase active en los planetas
        document.querySelectorAll('.planet-card').forEach((card, i) => {
            card.classList.toggle('active', i === clampedIndex);
        });
    }

    setupDragAndDrop() {
        const sliderTrack = document.getElementById('sliderTrack');
        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;
        
        sliderTrack.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            
            // Obtener la posición actual del transform
            const transform = window.getComputedStyle(sliderTrack).transform;
            if (transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                startScrollLeft = -matrix.m41;
            } else {
                startScrollLeft = 0;
            }
            
            sliderTrack.style.cursor = 'grabbing';
            sliderTrack.classList.add('dragging');
            e.preventDefault();
        });
        
        sliderTrack.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const currentX = e.clientX;
            const diff = startX - currentX;
            const newScrollLeft = startScrollLeft + diff;
            
            // Limitar el rango de movimiento
            const sliderContainer = document.querySelector('.slider-container');
            const containerWidth = sliderContainer.clientWidth;
            const cardWidth = 200;
            const gap = 32;
            const totalCardWidth = cardWidth + gap;
            const totalWidth = 10 * totalCardWidth; // 10 planetas * totalCardWidth
            const maxScroll = Math.max(0, totalWidth - containerWidth);
            const clampedScroll = Math.max(0, Math.min(maxScroll, newScrollLeft));
            
            sliderTrack.style.transform = `translateX(-${clampedScroll}px)`;
        });
        
        sliderTrack.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                sliderTrack.style.cursor = 'grab';
                sliderTrack.classList.remove('dragging');
                
                // Snap al planeta más cercano
                this.snapToNearestPlanet();
            }
        });
        
        sliderTrack.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                sliderTrack.style.cursor = 'grab';
                sliderTrack.classList.remove('dragging');
                this.snapToNearestPlanet();
            }
        });
        
        // Prevenir selección de texto durante el drag
        sliderTrack.addEventListener('selectstart', (e) => {
            if (isDragging) {
                e.preventDefault();
            }
        });
    }
    
    snapToNearestPlanet() {
        const sliderTrack = document.getElementById('sliderTrack');
        const sliderContainer = document.querySelector('.slider-container');
        const transform = window.getComputedStyle(sliderTrack).transform;
        let currentTranslate = 0;
        
        if (transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            currentTranslate = -matrix.m41;
        }
        
        const cardWidth = 200;
        const gap = 32;
        const totalCardWidth = cardWidth + gap;
        const containerWidth = sliderContainer.clientWidth;
        
        // Calcular qué planeta está más cerca del centro
        const centerOffset = (containerWidth - cardWidth) / 2;
        const centerPosition = currentTranslate + centerOffset;
        const planetIndex = Math.round(centerPosition / totalCardWidth);
        const clampedIndex = Math.max(0, Math.min(9, planetIndex));
        
        this.currentPlanetIndex = clampedIndex;
        this.scrollToPlanet(clampedIndex);
        this.updateSliderControls();
    }

    setupQuillEditor() {
        this.quillEditor = new Quill('#noteEditor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            placeholder: 'Escribe tu nota aquí...'
        });
    }

    setupResourceQuillEditor() {
        this.resourceQuillEditor = new Quill('#resourceNoteEditor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                ]
            },
            placeholder: 'Toma notas mientras ves el video...'
        });
    }

    loadNotes() {
        // Crear una clave única para las notas del usuario actual
        const userId = this.userData?.user_id || 'anonymous';
        const notesKey = `userNotes_${userId}`;
        
        const savedNotes = localStorage.getItem(notesKey);
        this.notes = savedNotes ? JSON.parse(savedNotes) : [
            {
                id: 1,
                title: 'Conceptos de Python',
                content: '<p>Variables, funciones, clases...</p>',
                tags: ['python', 'fundamentos'],
                createdAt: new Date().toISOString()
            }
        ];
        this.renderNotes();
    }

    renderNotes() {
        const notesGrid = document.getElementById('notesGrid');
        notesGrid.innerHTML = '';

        this.notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.innerHTML = `
                <h3>${note.title}</h3>
                <div class="content">${note.content}</div>
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                </div>
            `;
            noteCard.addEventListener('click', () => {
                this.editNote(note);
            });
            notesGrid.appendChild(noteCard);
        });
    }

    loadRoadmapProgress() {
        // Cargar progreso guardado del roadmap
        const savedProgress = localStorage.getItem('pythonRoadmap');
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                // Fusionar el progreso guardado con el roadmap por defecto
                Object.keys(progress).forEach(planetId => {
                    if (this.pythonRoadmap[planetId]) {
                        this.pythonRoadmap[planetId].status = progress[planetId].status;
                        this.pythonRoadmap[planetId].tasks = progress[planetId].tasks;
                    }
                });
            } catch (error) {
                console.error('Error loading roadmap progress:', error);
            }
        }
    }

    loadResources() {
        this.resources = [
            {
                id: 1,
                title: 'Fundamentos de Python',
                description: 'Video introductorio a Python',
                type: 'video',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                planet: 'fundamentals',
                tags: ['python', 'fundamentos']
            },
            {
                id: 2,
                title: 'Estructuras de Datos',
                description: 'Listas, tuplas y diccionarios',
                type: 'video',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                planet: 'data-structures',
                tags: ['python', 'estructuras']
            },
            {
                id: 3,
                title: 'Programación Orientada a Objetos',
                description: 'Clases y objetos en Python',
                type: 'video',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                planet: 'oop',
                tags: ['python', 'poo']
            }
        ];
        this.renderResources();
    }

    renderResources() {
        const resourcesGrid = document.getElementById('resourcesGrid');
        resourcesGrid.innerHTML = '';

        this.resources.forEach(resource => {
            const resourceCard = document.createElement('div');
            resourceCard.className = 'resource-card';
            resourceCard.innerHTML = `
                <div class="resource-thumbnail">
                    <span>🎥</span>
                </div>
                <div class="resource-content">
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-meta">
                        <span>Planeta: ${resource.planet}</span>
                        <span>Video</span>
                    </div>
                </div>
            `;
            resourceCard.addEventListener('click', () => {
                this.openResourceModal(resource);
            });
            resourcesGrid.appendChild(resourceCard);
        });
    }

    openPlanetModal(planetId) {
        const planetData = this.pythonRoadmap[planetId];
        if (!planetData) return;

        const modal = document.getElementById('planetModal');
        const title = document.getElementById('planetTitle');
        const name = document.getElementById('planetModalName');
        const description = document.getElementById('planetModalDescription');
        const status = document.getElementById('planetModalStatus');
        const image = document.getElementById('planetModalImage');
        const tasks = document.getElementById('planetModalTasks');
        const resources = document.getElementById('planetModalResources');
        const completedTasks = document.getElementById('completedTasks');
        const totalTasks = document.getElementById('totalTasks');
        const xpEarned = document.getElementById('xpEarned');

        title.textContent = planetData.name;
        name.textContent = planetData.name;
        description.textContent = planetData.description;
        status.textContent = this.getStatusText(planetData.status);
        
        const planetOrder = ['fundamentals', 'control-flow', 'data-structures', 'functions', 'oop', 'modules', 'exceptions', 'file-io', 'web', 'data-science'];
        const planetIndex = planetOrder.indexOf(planetId);
        image.src = `assets/ui_elements/planeta${(planetIndex % 4) + 1}.png`;

        // Resetear contador de tareas marcadas en esta sesión
        this.tasksMarkedInCurrentSession = 0;
        
        // Ocultar warning al abrir el modal
        const warning = document.getElementById('easterEggWarning');
        warning.style.display = 'none';
        
        // NOTA: No se resetea this.warningCount para mantener el conteo del easter egg

        // Renderizar tareas
        const completedCount = planetData.tasks.filter(task => task.completed).length;
        const totalCount = planetData.tasks.length;
        const earnedXP = planetData.tasks.filter(task => task.completed).reduce((sum, task) => sum + task.xp, 0);

        completedTasks.textContent = completedCount;
        totalTasks.textContent = totalCount;
        xpEarned.textContent = `${earnedXP} XP`;

        tasks.innerHTML = planetData.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-planet-id="${planetId}" data-task-id="${task.id}"></div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description}</div>
                </div>
                <div class="task-xp">
                    <span>⭐</span>
                    <span>${task.xp} XP</span>
                </div>
            </div>
        `).join('');

        // Agregar event listeners a los checkboxes después de renderizar
        const dashboardInstance = this; // Guardar referencia a la instancia
        tasks.querySelectorAll('.task-checkbox').forEach(checkbox => {
            // Remover event listeners previos para evitar duplicados
            checkbox.replaceWith(checkbox.cloneNode(true));
        });
        
        // Agregar nuevos event listeners
        tasks.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', function(e) {
                const planetId = this.dataset.planetId;
                const taskId = parseInt(this.dataset.taskId);
                dashboardInstance.toggleTask(planetId, taskId);
            });
        });

        // Renderizar recursos
        resources.innerHTML = planetData.resources.map(resource => 
            `<div class="resource-item">📚 ${resource}</div>`
        ).join('');

        modal.classList.add('active');
        this.currentPlanetId = planetId;
    }

    updateModalUI(planetId) {
        const planetData = this.pythonRoadmap[planetId];
        if (!planetData) return;

        // Actualizar contadores del modal
        const completedTasks = document.getElementById('completedTasks');
        const totalTasks = document.getElementById('totalTasks');
        const xpEarned = document.getElementById('xpEarned');
        
        if (completedTasks && totalTasks && xpEarned) {
            const completedCount = planetData.tasks.filter(task => task.completed).length;
            const totalCount = planetData.tasks.length;
            const earnedXP = planetData.tasks.filter(task => task.completed).reduce((sum, task) => sum + task.xp, 0);

            completedTasks.textContent = completedCount;
            totalTasks.textContent = totalCount;
            xpEarned.textContent = `${earnedXP} XP`;
        }

        // Actualizar estado visual de las tareas
        planetData.tasks.forEach(task => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                const checkbox = taskElement.querySelector('.task-checkbox');
                if (checkbox) {
                    checkbox.classList.toggle('checked', task.completed);
                }
                taskElement.classList.toggle('completed', task.completed);
            }
        });
    }

    toggleTask(planetId, taskId) {
        console.log('🔧 toggleTask llamado:', { planetId, taskId });
        console.log('🔧 Estado actual:', { 
            tasksMarkedInSession: this.tasksMarkedInCurrentSession,
            warningCount: this.warningCount 
        });
        
        const planetData = this.pythonRoadmap[planetId];
        const task = planetData.tasks.find(t => t.id === taskId);
        
        if (task) {
            if (task.completed) {
                // Desmarcar tarea
                task.completed = false;
                this.tasksMarkedInCurrentSession--;
                if (this.userData.points) {
                    this.userData.points -= task.xp;
                }
            } else {
                // Intentar marcar tarea
                console.log('🔧 Intentando marcar tarea. Estado actual:', this.tasksMarkedInCurrentSession);
                
                if (this.tasksMarkedInCurrentSession >= 1) {
                    // Ya hay una tarea marcada en esta apertura del modal
                    console.log('🔧 ¡WARNING! Ya hay una tarea marcada');
                    this.showEasterEggWarning();
                    return;
                } else {
                    // Marcar tarea
                    task.completed = true;
                    this.tasksMarkedInCurrentSession++;
                    console.log('🔧 Tarea marcada. Nuevo estado:', this.tasksMarkedInCurrentSession);
                    
                    if (!this.userData.points) {
                        this.userData.points = 0;
                    }
                    this.userData.points += task.xp;
                    
                    // Mostrar mensaje de éxito
                    this.showSuccessMessage(`¡Progreso guardado exitosamente! +${task.xp} XP`);
                }
            }
            
            // Guardar en localStorage
            localStorage.setItem('userData', JSON.stringify(this.userData));
            localStorage.setItem('pythonRoadmap', JSON.stringify(this.pythonRoadmap));
            
            // Verificar si se completó el planeta
            this.checkPlanetCompletion(planetId);
            
            // Actualizar UI
            this.updateUserInterface();
            this.updateRoadmapProgress();
            
            // NO recargar el modal, solo actualizar la UI del modal actual
            this.updateModalUI(planetId);
        }
    }
    
    showEasterEggWarning() {
        console.log('🚨 ¡WARNING MOSTRADO! Contador:', this.warningCount + 1);
        
        const warning = document.getElementById('easterEggWarning');
        const modal = document.getElementById('planetModal');
        
        // Incrementar contador de warnings
        this.warningCount++;
        
        // Mostrar el warning centrado en el viewport
        warning.style.display = 'block';
        
        // Agregar borde amarillo al modal
        modal.style.border = '3px solidrgb(251, 36, 36)';
        modal.style.boxShadow = '0 0 20px rgba(233, 11, 11, 0.5)';
        
        // Verificar si debe mostrar el easter egg (después de 5 warnings)
        if (this.warningCount >= 5) {
            this.showEasterEgg();
        }
        
        // Ocultar después de 5 segundos y restaurar el modal
        setTimeout(() => {
            warning.style.display = 'none';
            modal.style.border = '';
            modal.style.boxShadow = '';
        }, 5000);
    }

    showSuccessMessage(message) {
        // Crear el mensaje de éxito
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✅</div>
                <div class="success-text">
                    <h4>¡Éxito!</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        // Agregar al body
        document.body.appendChild(successMessage);
        
        // Mostrar con animación
        setTimeout(() => {
            successMessage.classList.add('active');
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            successMessage.classList.remove('active');
            setTimeout(() => {
                successMessage.remove();
            }, 300);
        }, 3000);
    }

    showEasterEgg() {
        // Crear el modal del easter egg - solo la imagen
        const easterEggModal = document.createElement('div');
        easterEggModal.className = 'easter-egg-modal';
        easterEggModal.innerHTML = `
            <div class="easter-egg-backdrop"></div>
            <div class="easter-egg-content">
                <div class="easter-egg-image">
                    <img src="assets/ui_elements/cerebrito.jpg" alt="Cerebrito" />
                </div>
            </div>
        `;
        
        // Agregar al body
        document.body.appendChild(easterEggModal);
        
        // Mostrar con animación
        setTimeout(() => {
            easterEggModal.classList.add('active');
        }, 100);
        
        // Resetear contador de warnings
        this.warningCount = 0;
        
        // Ocultar automáticamente después de 3 segundos
        setTimeout(() => {
            easterEggModal.remove();
        }, 3000);
    }

    checkPlanetCompletion(planetId) {
        const planetData = this.pythonRoadmap[planetId];
        const allTasksCompleted = planetData.tasks.every(task => task.completed);
        
        if (allTasksCompleted && planetData.status !== 'completed') {
            planetData.status = 'completed';
            
            // Desbloquear siguiente planeta
            this.unlockNextPlanet(planetId);
            
            // Guardar progreso en localStorage
            localStorage.setItem('pythonRoadmap', JSON.stringify(this.pythonRoadmap));
        }
    }

    unlockNextPlanet(completedPlanetId) {
        const planetOrder = ['fundamentals', 'control-flow', 'data-structures', 'functions', 'oop', 'modules', 'exceptions', 'file-io', 'web', 'data-science'];
        const currentIndex = planetOrder.indexOf(completedPlanetId);
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < planetOrder.length) {
            const nextPlanetId = planetOrder[nextIndex];
            this.pythonRoadmap[nextPlanetId].status = 'unlocked';
            
            // Actualizar UI
            this.renderRoadmap();
            this.updateRoadmapProgress();
        }
    }

    closePlanetModal() {
        const modal = document.getElementById('planetModal');
        const warning = document.getElementById('easterEggWarning');
        
        // Limpiar estado del modal
        modal.classList.remove('active');
        modal.style.border = '';
        modal.style.boxShadow = '';
        
        // Ocultar warning
        warning.style.display = 'none';
        
        // Resetear contador de tareas marcadas
        this.tasksMarkedInCurrentSession = 0;
        
        // NOTA: No se resetea this.warningCount para mantener el conteo del easter egg
        
        this.currentPlanetId = null;
    }

    startPlanetLearning() {
        if (this.currentPlanetId) {
            // Mostrar mensaje de éxito verde
            this.showSuccessMessage('¡Progreso guardado con éxito!');
            this.closePlanetModal();
        }
    }

    getStatusText(status) {
        const statusMap = {
            'completed': 'Completado',
            'unlocked': 'Disponible',
            'locked': 'Bloqueado'
        };
        return statusMap[status] || status;
    }

    openNoteModal(note = null) {
        const modal = document.getElementById('noteModal');
        const titleInput = document.getElementById('noteTitle');
        const modalTitle = document.getElementById('modalTitle');

        if (note) {
            modalTitle.textContent = 'Editar Nota';
            titleInput.value = note.title;
            this.quillEditor.root.innerHTML = note.content;
            this.currentEditingNote = note;
        } else {
            modalTitle.textContent = 'Nueva Nota';
            titleInput.value = '';
            this.quillEditor.setText('');
            this.currentEditingNote = null;
        }

        modal.classList.add('active');
    }

    closeNoteModal() {
        const modal = document.getElementById('noteModal');
        modal.classList.remove('active');
        this.currentEditingNote = null;
    }

    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = this.quillEditor.root.innerHTML;
        const tags = document.getElementById('noteTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

        if (!title) {
            alert('Por favor ingresa un título para la nota');
            return;
        }

        if (this.currentEditingNote) {
            // Editar nota existente
            this.currentEditingNote.title = title;
            this.currentEditingNote.content = content;
            this.currentEditingNote.tags = tags;
        } else {
            // Crear nueva nota
            const newNote = {
                id: Date.now(),
                title,
                content,
                tags,
                createdAt: new Date().toISOString()
            };
            this.notes.unshift(newNote);
        }

        // Guardar notas con clave única del usuario
        const userId = this.userData?.user_id || 'anonymous';
        const notesKey = `userNotes_${userId}`;
        localStorage.setItem(notesKey, JSON.stringify(this.notes));
        this.renderNotes();
        this.closeNoteModal();
    }

    editNote(note) {
        this.openNoteModal(note);
    }

    openResourceModal(resource) {
        const modal = document.getElementById('resourceModal');
        const videoFrame = document.getElementById('videoFrame');
        const resourceTitle = document.getElementById('resourceTitle');

        resourceTitle.textContent = resource.title;
        videoFrame.src = resource.url;

        modal.classList.add('active');
    }

    closeResourceModal() {
        const modal = document.getElementById('resourceModal');
        const videoFrame = document.getElementById('videoFrame');
        
        videoFrame.src = '';
        modal.classList.remove('active');
    }

    renderDashboard() {
        // El dashboard se renderiza automáticamente con el HTML
        // Solo necesitamos actualizar datos dinámicos
        this.updateUserInterface();
    }

    async logout() {
        try {
            // Intentar hacer logout en el backend
            await apiService.logout();
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Limpiar datos locales
            apiService.clearTokens();
            localStorage.removeItem('userNotes');
            localStorage.removeItem('userData');
            localStorage.removeItem('loginTimestamp');
            sessionStorage.clear();
            
            // Redirigir a login
            window.location.href = 'login.html';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
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
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 4000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
