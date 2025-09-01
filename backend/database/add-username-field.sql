-- Script para agregar el campo username a la tabla users
USE vmind;

-- Agregar campo username después del campo user_name
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL AFTER user_name;

-- Crear índice para mejorar el rendimiento de búsquedas por username
CREATE INDEX idx_users_username ON users(username);

-- Actualizar usuarios existentes con un username basado en su email
UPDATE users SET username = CONCAT('user_', SUBSTRING_INDEX(email, '@', 1)) WHERE username IS NULL OR username = '';

-- Verificar que la tabla se actualizó correctamente
DESCRIBE users;
