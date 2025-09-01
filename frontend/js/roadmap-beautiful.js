// ===== ROADMAP HERMOSO CONECTADO A LA API REAL =====

import { apiService, ApiError } from './services/api.js';
import { getConfig } from './config.js';

class BeautifulRoadmap {
    constructor() {
        this.currentPlanetIndex = 0;
        this.notes = [];
        this.currentPlanetId = null;
        this.currentResource = null;
        this.roadmaps = [];
        this.currentRoadmap = null;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartScrollLeft = 0;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadRoadmaps();
        this.renderRoadmap();
        this.setupSliderControls();
        this.setupModals();
    }

    setupEventListeners() {
        // Eventos del slider
        const sliderTrack = document.getElementById('sliderTrack');
        if (sliderTrack) {
            sliderTrack.addEventListener('mousedown', (e) => this.startDragging(e));
            sliderTrack.addEventListener('mousemove', (e) => this.dragging(e));
            sliderTrack.addEventListener('mouseup', () => this.stopDragging());
            sliderTrack.addEventListener('mouseleave', () => this.stopDragging());
            
            // Touch events para móviles
            sliderTrack.addEventListener('touchstart', (e) => this.startDragging(e));
            sliderTrack.addEventListener('touchmove', (e) => this.dragging(e));
            sliderTrack.addEventListener('touchend', () => this.stopDragging());
        }

        // Controles del slider
        document.getElementById('prevPlanet')?.addEventListener('click', () => this.prevPlanet());
        document.getElementById('nextPlanet')?.addEventListener('click', () => this.nextPlanet());

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevPlanet();
            if (e.key === 'ArrowRight') this.nextPlanet();
        });
    }

    async loadRoadmaps() {
        try {
            console.log('🔄 Cargando roadmaps desde la API...');
            const response = await apiService.getRoadmaps();
            this.roadmaps = response.roadmaps || [];
            
            if (this.roadmaps.length > 0) {
                this.currentRoadmap = this.roadmaps[0];
                console.log('✅ Roadmaps cargados:', this.roadmaps.length);
            } else {
                console.warn('⚠️ No se encontraron roadmaps');
                this.createDefaultRoadmap();
            }
        } catch (error) {
            console.error('❌ Error cargando roadmaps:', error);
            this.createDefaultRoadmap();
        }
    }

    createDefaultRoadmap() {
        // Roadmap por defecto si no hay datos en la API
        this.currentRoadmap = {
            roadmap_id: 1,
            title: "Python para Principiantes",
            description: "Aprende Python desde cero hasta avanzado",
            topic: "Programación",
            difficulty: "beginner",
            levels: [
                {
                    level_id: 1,
                    title: "Fundamentos de Python",
                    description: "Los cimientos de tu viaje de programación",
                    status: "unlocked",
                    tasks: [
                        { task_id: 1, title: "Crear tu primer programa 'Hola Mundo'", xp_reward: 50, status: "pending" },
                        { task_id: 2, title: "Aprender sobre variables", xp_reward: 75, status: "pending" },
                        { task_id: 3, title: "Practicar con tipos de datos", xp_reward: 100, status: "pending" }
                    ]
                },
                {
                    level_id: 2,
                    title: "Control de Flujo",
                    description: "Aprende a controlar el flujo de tu programa",
                    status: "locked",
                    tasks: [
                        { task_id: 4, title: "Usar condicionales if/else", xp_reward: 100, status: "pending" },
                        { task_id: 5, title: "Implementar bucles for", xp_reward: 125, status: "pending" }
                    ]
                }
            ]
        };
    }

    renderRoadmap() {
        if (!this.currentRoadmap) return;
        
        const sliderTrack = document.getElementById('sliderTrack');
        if (!sliderTrack) return;
        
        sliderTrack.innerHTML = '';
        
        this.currentRoadmap.levels.forEach((level, index) => {
            const planetElement = this.createPlanetElement(level, index);
            sliderTrack.appendChild(planetElement);
        });

        this.updateProgress();
    }

    createPlanetElement(level, index) {
        const planet = document.createElement('div');
        planet.className = `planet ${level.status}`;
        planet.dataset.levelId = level.level_id;
        planet.dataset.index = index;
        
        const planetImage = this.getPlanetImage(index);
        const statusText = this.getStatusText(level.status);
        
        planet.innerHTML = `
                <div class="planet-image">
                <img src="${planetImage}" alt="Planeta ${level.title}">
                <div class="planet-glow"></div>
                </div>
                <div class="planet-info">
                <h3 class="planet-title">${level.title}</h3>
                <p class="planet-description">${level.description}</p>
                <div class="planet-status ${level.status}">${statusText}</div>
                <div class="planet-tasks">
                    <span class="completed">${level.tasks.filter(t => t.status === 'completed').length}</span>
                    /
                    <span class="total">${level.tasks.length}</span>
                    tareas
                </div>
                </div>
            `;
            
        planet.addEventListener('click', () => this.openPlanetModal(level));
        return planet;
    }

    getPlanetImage(index) {
        const planetImages = [
            'assets/ui_elements/planeta1.png',
            'assets/ui_elements/planeta2.png',
            'assets/ui_elements/planeta3.png',
            'assets/ui_elements/planeta4.png'
        ];
        return planetImages[index % planetImages.length];
    }

    getStatusText(status) {
        const statusMap = {
            'unlocked': 'Desbloqueado',
            'locked': 'Bloqueado',
            'completed': 'Completado'
        };
        return statusMap[status] || status;
    }

    updateProgress() {
        if (!this.currentRoadmap) return;
        
        const totalLevels = this.currentRoadmap.levels.length;
        const completedLevels = this.currentRoadmap.levels.filter(l => l.status === 'completed').length;
        const progressPercentage = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
        
        const progressFill = document.getElementById('roadmapProgress');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${progressPercentage}%`;
        if (progressText) progressText.textContent = `${completedLevels} de ${totalLevels} planetas completados`;
    }

    setupSliderControls() {
        const prevBtn = document.getElementById('prevPlanet');
        const nextBtn = document.getElementById('nextPlanet');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevPlanet());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPlanet());
    }

    prevPlanet() {
        if (this.currentPlanetIndex > 0) {
            this.currentPlanetIndex--;
            this.scrollToPlanet();
        }
    }

    nextPlanet() {
        const totalPlanets = this.currentRoadmap?.levels?.length || 0;
        if (this.currentPlanetIndex < totalPlanets - 1) {
            this.currentPlanetIndex++;
            this.scrollToPlanet();
        }
    }

    scrollToPlanet() {
        const sliderTrack = document.getElementById('sliderTrack');
        if (!sliderTrack) return;
        
        const planetWidth = 300; // Ancho aproximado de cada planeta
        const scrollPosition = this.currentPlanetIndex * planetWidth;
        
        sliderTrack.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    setupModals() {
        // Modal del cerebrito
        const cerebritoModal = document.getElementById('cerebritoModal');
        const closeCerebritoBtn = document.getElementById('closeCerebritoModal');
        
        if (closeCerebritoBtn) {
            closeCerebritoBtn.addEventListener('click', () => {
                cerebritoModal.classList.remove('show');
            });
        }

        // Modal de planetas
        const planetModal = document.getElementById('planetModal');
        const closePlanetBtn = document.getElementById('closePlanetModal');
        
        if (closePlanetBtn) {
            closePlanetBtn.addEventListener('click', () => {
                planetModal.classList.remove('show');
            });
        }

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === cerebritoModal) {
                cerebritoModal.classList.remove('show');
            }
            if (e.target === planetModal) {
                planetModal.classList.remove('show');
            }
        });
    }

    openPlanetModal(level) {
        this.currentPlanetId = level.level_id;
        
        const modal = document.getElementById('planetModal');
        const title = document.getElementById('planetTitle');
        const name = document.getElementById('planetModalName');
        const description = document.getElementById('planetModalDescription');
        const status = document.getElementById('planetModalStatus');
        const image = document.getElementById('planetModalImage');
        const completedTasks = document.getElementById('completedTasks');
        const totalTasks = document.getElementById('totalTasks');
        
        if (title) title.textContent = level.title;
        if (name) name.textContent = level.title;
        if (description) description.textContent = level.description;
        if (status) {
            status.textContent = this.getStatusText(level.status);
            status.className = `planet-status-large ${level.status}`;
        }
        if (image) image.src = this.getPlanetImage(0);
        if (completedTasks) completedTasks.textContent = level.tasks.filter(t => t.status === 'completed').length;
        if (totalTasks) totalTasks.textContent = level.tasks.length;
        
        modal.classList.add('show');
        this.renderTasks(level.tasks);
    }

    renderTasks(tasks) {
        const tasksContainer = document.querySelector('.tasks-list');
        if (!tasksContainer) return;
        
        tasksContainer.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.status}`;
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <h4 class="task-title">${task.title}</h4>
                    <div class="task-xp">⭐ ${task.xp_reward} XP</div>
                </div>
                <div class="task-status ${task.status}">
                    ${this.getTaskStatusText(task.status)}
            </div>
        `;
            
            if (task.status === 'pending') {
                taskElement.addEventListener('click', () => this.completeTask(task.task_id));
            }
            
            tasksContainer.appendChild(taskElement);
        });
    }

    getTaskStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'completed': 'Completada'
        };
        return statusMap[status] || status;
    }

    async completeTask(taskId) {
        try {
            // Aquí iría la lógica para marcar la tarea como completada
            console.log(`✅ Tarea ${taskId} marcada como completada`);
            
            // Mostrar modal del cerebrito
            const cerebritoModal = document.getElementById('cerebritoModal');
            if (cerebritoModal) {
                cerebritoModal.classList.add('show');
                
                // Cerrar automáticamente después de 3 segundos
        setTimeout(() => {
                    cerebritoModal.classList.remove('show');
        }, 3000);
    }
            
            // Actualizar el estado local
            this.updateTaskStatus(taskId, 'completed');
            
        } catch (error) {
            console.error('❌ Error completando tarea:', error);
        }
    }

    updateTaskStatus(taskId, status) {
        if (!this.currentRoadmap) return;
        
        this.currentRoadmap.levels.forEach(level => {
            level.tasks.forEach(task => {
                if (task.task_id === taskId) {
                    task.status = status;
                }
            });
        });
        
        this.renderRoadmap();
    }

    // Funciones de drag and drop para el slider
    startDragging(e) {
        this.isDragging = true;
        this.dragStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        this.dragStartY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        this.dragStartScrollLeft = e.target.scrollLeft;
        
        e.preventDefault();
    }

    dragging(e) {
        if (!this.isDragging) return;
        
        const x = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const y = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        const walkX = (x - this.dragStartX) * 2;
        
        e.target.scrollLeft = this.dragStartScrollLeft - walkX;
    }

    stopDragging() {
        this.isDragging = false;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.beautifulRoadmap = new BeautifulRoadmap();
});
