-- Vmind Database Schema
-- Personalized learning platform

CREATE DATABASE IF NOT EXISTS vmind;
USE vmind;

-- User table
CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    passwords VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'user') DEFAULT 'user',
    objetive TEXT,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_connection DATETIME NULL,
    current_level INT DEFAULT 0,
    preferred_language VARCHAR(10) DEFAULT 'es'
);

-- Roadmap table (learning routes)
CREATE TABLE roadmaps (
    roadmap_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    roadmap_description TEXT,
    topic VARCHAR(100) NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    estimated_time INT DEFAULT 0,
    user_id CHAR(36),
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Table of levels within the roadmaps
CREATE TABLE levels (
    level_id INT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    order_number INT NOT NULL,
    xp_reward INT DEFAULT 0,
    status ENUM('locked', 'unlocked', 'completed') DEFAULT 'locked',
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(roadmap_id) ON DELETE CASCADE
);

-- Table of tasks within the levels
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    level_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    type ENUM('quiz', 'reading', 'practice', 'project') NOT NULL,
    xp_reward INT DEFAULT 0,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    FOREIGN KEY (level_id) REFERENCES levels(level_id) ON DELETE CASCADE
);

-- User Task Table (Progress)
CREATE TABLE user_tasks (
    user_task_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    task_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
    date_completed DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Table of achievements/triumphs
CREATE TABLE triumphs (
    triumph_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    xp_required INT DEFAULT 0,
    type_triumph ENUM('progress', 'streak', 'special') NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE user_triumphs (
    user_triumph_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    triumph_id INT NOT NULL,
    date_earned DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (triumph_id) REFERENCES triumphs(triumph_id) ON DELETE CASCADE
);

-- Tabla de rachas de días activos
CREATE TABLE streaks (
    streak_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    start_date DATETIME NOT NULL,
    longest_streak_days INT DEFAULT 0,
    last_active_date DATETIME,
    current_streak_days INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de intereses
CREATE TABLE interests (
    interest_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de niveles de conocimiento por interés
CREATE TABLE interest_levels (
    user_id CHAR(36) NOT NULL,
    interest_id INT NOT NULL,
    knowledge_level ENUM('novato', 'principiante', 'intermedio', 'avanzado', 'experto') NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(interest_id) ON DELETE CASCADE
);

-- Tabla de caracterización del usuario
CREATE TABLE user_characterization (
    characterization_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    learning_goal TEXT,
    learning_pace ENUM('rapido', 'equilibrado', 'tranquilo') DEFAULT 'equilibrado',
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de historial de cambios de ritmo de aprendizaje
CREATE TABLE user_pace_history (
    pace_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    learning_pace ENUM('rapido', 'equilibrado', 'tranquilo') NOT NULL,
    date_changed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de notas del usuario
CREATE TABLE notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de recursos guardados
CREATE TABLE resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    type ENUM('video', 'pdf', 'web', 'otro') NOT NULL,
    link TEXT,
    duration_minutes INT,
    date_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmaps_topic ON roadmaps(topic);
CREATE INDEX idx_roadmaps_difficulty ON roadmaps(difficulty);
CREATE INDEX idx_levels_roadmap_id ON levels(roadmap_id);
CREATE INDEX idx_tasks_level_id ON tasks(level_id);
CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX idx_user_triumphs_user_id ON user_triumphs(user_id);
CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_resources_user_id ON resources(user_id);

-- Datos de ejemplo para pruebas
-- Usuario 1: Laura
INSERT INTO users (user_id, user_name, email, phone, passwords, rol, objetive, preferred_language)
VALUES ('uuid-1234-5678', 'Laura Gómez', 'laura@example.com', '3001234567', 'laura123', 'user',
        'Quiero convertirme en desarrolladora web', 'es');

-- Usuario 2: Admin
INSERT INTO users (user_id, user_name, email, phone, passwords, rol, objetive, preferred_language)
VALUES ('uuid-admin-9999', 'Carlos Rodríguez', 'carlos@example.com', '3009876543', 'carlos123', 'admin',
        'Enseñar programación a otros', 'es');

-- Intereses
INSERT INTO interests (name) VALUES 
('Programación Web'),
('Inteligencia Artificial'),
('Ciberseguridad'),
('Desarrollo Móvil'),
('DevOps');

-- Intereses de Laura
INSERT INTO interest_levels (user_id, interest_id, knowledge_level)
VALUES ('uuid-1234-5678', 1, 'principiante');

-- Intereses del admin
INSERT INTO interest_levels (user_id, interest_id, knowledge_level)
VALUES 
('uuid-admin-9999', 1, 'experto'),
('uuid-admin-9999', 2, 'avanzado'),
('uuid-admin-9999', 3, 'intermedio');

-- Caracterización de Laura
INSERT INTO user_characterization (user_id, learning_goal, learning_pace)
VALUES ('uuid-1234-5678', 'Conseguir un empleo en desarrollo web en 6 meses', 'equilibrado');

-- Caracterización del admin
INSERT INTO user_characterization (user_id, learning_goal, learning_pace)
VALUES ('uuid-admin-9999', 'Ayudar a otros a aprender programación', 'rapido');

-- Roadmap 1: Desarrollo Web (creado por Laura)
INSERT INTO roadmaps (title, roadmap_description, topic, difficulty, estimated_time, user_id)
VALUES ('Roadmap de Desarrollo Web', 'Ruta de aprendizaje para front-end y back-end', 'Programación Web',
        'beginner', 180, 'uuid-1234-5678');

-- Roadmap 2: Python (creado por admin)
INSERT INTO roadmaps (title, roadmap_description, topic, difficulty, estimated_time, user_id)
VALUES ('Roadmap de Python', 'Aprende Python desde cero hasta avanzado', 'Programación',
        'beginner', 240, 'uuid-admin-9999');

-- Niveles del Roadmap de Desarrollo Web (roadmap_id = 1)
INSERT INTO levels (roadmap_id, title, description, order_number, xp_reward, status)
VALUES 
(1, 'HTML & CSS Básico', 'Aprende a estructurar páginas web', 1, 100, 'unlocked'),
(1, 'JavaScript Inicial', 'Primeros pasos con la programación web', 2, 150, 'locked'),
(1, 'React Fundamentals', 'Introducción a React y componentes', 3, 200, 'locked');

-- Niveles del Roadmap de Python (roadmap_id = 2)
INSERT INTO levels (roadmap_id, title, description, order_number, xp_reward, status)
VALUES 
(2, 'Python Básico', 'Variables, tipos de datos y estructuras de control', 1, 100, 'unlocked'),
(2, 'Funciones y Módulos', 'Crear funciones y usar módulos', 2, 150, 'locked'),
(2, 'POO en Python', 'Programación orientada a objetos', 3, 200, 'locked');

-- Tareas del nivel 1 (HTML & CSS Básico)
INSERT INTO tasks (level_id, title, description, type, xp_reward, status)
VALUES 
(1, 'Leer introducción a HTML', 'Material básico de etiquetas HTML', 'reading', 50, 'pending'),
(1, 'Practicar con CSS', 'Aplicar estilos a una página simple', 'practice', 50, 'pending');

-- Tareas del nivel 2 (JavaScript Inicial)
INSERT INTO tasks (level_id, title, description, type, xp_reward, status)
VALUES 
(2, 'Hacer un quiz de JavaScript', 'Preguntas básicas sobre variables y funciones', 'quiz', 75, 'pending');

-- Tareas del nivel 3 (React Fundamentals)
INSERT INTO tasks (level_id, title, description, type, xp_reward, status)
VALUES 
(3, 'Crear un proyecto React', 'Desarrollar una aplicación simple con React', 'project', 100, 'pending');

-- Tareas del nivel 4 (Python Básico)
INSERT INTO tasks (level_id, title, description, type, xp_reward, status)
VALUES 
(4, 'Instalar Python', 'Configurar el entorno de desarrollo', 'practice', 25, 'pending'),
(4, 'Variables y tipos', 'Practicar con diferentes tipos de datos', 'practice', 50, 'pending');

-- Tareas del nivel 5 (Funciones y Módulos)
INSERT INTO tasks (level_id, title, description, type, xp_reward, status)
VALUES 
(5, 'Crear funciones', 'Desarrollar funciones personalizadas', 'practice', 75, 'pending');

-- Tareas del nivel 6 (POO en Python)
INSERT INTO tasks (level_id, title, description, type, xp_reward, status)
VALUES 
(6, 'Proyecto final', 'Crear una aplicación completa con POO', 'project', 150, 'pending');

-- Progreso de Laura en tareas
INSERT INTO user_tasks (user_task_id, user_id, task_id, status, date_completed)
VALUES 
('uuid-task-1', 'uuid-1234-5678', 1, 'completed', NOW()),
('uuid-task-2', 'uuid-1234-5678', 2, 'in_progress', NULL);

-- Logros/triumphs
INSERT INTO triumphs (title, description, icon, xp_required, type_triumph)
VALUES 
('Primer paso', 'Completaste tu primera tarea', 'icon1.png', 50, 'progress'),
('Constancia', 'Completaste 5 días seguidos', 'icon2.png', 0, 'streak'),
('Explorador', 'Completaste 3 roadmaps diferentes', 'icon3.png', 200, 'special');

-- Logros de Laura
INSERT INTO user_triumphs (user_id, triumph_id)
VALUES ('uuid-1234-5678', 1);

-- Racha de Laura
INSERT INTO streaks (user_id, start_date, longest_streak_days, last_active_date, current_streak_days)
VALUES ('uuid-1234-5678', '2025-01-20', 3, NOW(), 2);

-- Notas de Laura
INSERT INTO notes (user_id, title, content)
VALUES ('uuid-1234-5678', 'Apuntes HTML', 'Recordar que siempre se cierra la etiqueta <p> y usar semantic HTML');

-- Recursos de Laura
INSERT INTO resources (user_id, title, type, link, duration_minutes)
VALUES 
('uuid-1234-5678', 'Curso HTML en YouTube', 'video', 'https://youtube.com/cursohtml', 45),
('uuid-1234-5678', 'Documentación CSS', 'web', 'https://developer.mozilla.org/css', NULL);

COMMIT;
