# 🚀 V-Mind - Plataforma de Aprendizaje Gamificado

V-Mind es una plataforma de aprendizaje inteligente que combina roadmaps personalizados, gamificación y seguimiento de progreso para crear una experiencia de aprendizaje única y motivadora.

## ✨ Características

- 🎯 **Roadmaps Personalizados**: Rutas de aprendizaje adaptadas a tus objetivos
- 🏆 **Sistema de Gamificación**: XP, niveles, rachas y logros
- 📝 **Notas y Recursos**: Organiza tu conocimiento y materiales de estudio
- 📊 **Seguimiento de Progreso**: Estadísticas detalladas de tu aprendizaje
- 🌟 **Interfaz Espacial**: Diseño moderno con tema espacial
- 🔐 **Autenticación Segura**: Sistema JWT con refresh tokens
- 📱 **Responsive Design**: Funciona en cualquier dispositivo

## 🛠️ Tecnologías

### Frontend
- **HTML5** + **CSS3** + **JavaScript (ES6+)**
- **Vite** - Bundler y servidor de desarrollo
- **Chart.js** - Gráficos y estadísticas
- **Quill.js** - Editor de texto rico

### Backend
- **Node.js** + **Express.js**
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **bcryptjs** - Encriptación de contraseñas
- **helmet** - Seguridad HTTP
- **express-rate-limit** - Protección contra ataques

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)

```bash
# Clonar el repositorio
git clone <repository-url>
cd vmind

# Ejecutar script de configuración universal
./setup-universal.sh
```

### Opción 2: Configuración Manual

#### Prerrequisitos
- **Node.js** (v16 o superior)
- **npm** (v8 o superior)
- **MySQL** (v8.0 o superior)
- **Git**

#### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd vmind
```

2. **Instalar dependencias**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Configurar MySQL**
```bash
# Crear base de datos
mysql -u root -p < backend/database/schema-corrected.sql
```

4. **Configurar variables de entorno**
```bash
# Backend
cp backend/env.example backend/.env
# Editar backend/.env con tus credenciales de MySQL
```

5. **Iniciar la aplicación**
```bash
# Usar el script de inicio
./start-complete.sh

# O manualmente
npm run full-dev
```

## 🌍 Configuración en Distintas Máquinas

### Linux (Ubuntu/Debian)
```bash
# Instalar dependencias
sudo apt update
sudo apt install nodejs npm mysql-server git

# Configurar MySQL
sudo mysql_secure_installation

# Ejecutar script de configuración
./setup-universal.sh
```

### macOS
```bash
# Instalar Homebrew (si no está instalado)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependencias
brew install node mysql git

# Ejecutar script de configuración
./setup-universal.sh
```

### Windows
```bash
# Instalar manualmente:
# 1. Node.js desde https://nodejs.org/
# 2. MySQL desde https://dev.mysql.com/downloads/
# 3. Git desde https://git-scm.com/

# O usar WSL2 para mejor experiencia
wsl --install

# Luego ejecutar el script de configuración
./setup-universal.sh
```

## �� Estructura del Proyecto

```
V-Mind/
├── frontend/                 # Frontend de la aplicación
│   ├── assets/              # Imágenes y recursos
│   ├── css/                 # Estilos CSS
│   ├── js/                  # JavaScript modular
│   │   ├── config.js        # Configuración centralizada
│   │   ├── services/        # Servicios API
│   │   └── ...
│   ├── index.html           # Página principal
│   ├── login.html           # Página de login
│   ├── dashboard.html       # Dashboard principal
│   └── register.html        # Página de registro
├── backend/                  # Backend API
│   ├── config/              # Configuración de base de datos
│   ├── controllers/         # Controladores de la API
│   ├── database/            # Esquemas y scripts SQL
│   ├── middleware/          # Middleware personalizado
│   ├── models/              # Modelos de datos
│   ├── routes/              # Rutas de la API
│   └── server.js            # Servidor principal
├── scripts/                  # Scripts de utilidad
├── start-complete.sh        # Script de inicio completo
├── setup-universal.sh       # Script de configuración universal
└── README.md                # Este archivo
```

## 🔧 Scripts Disponibles

### Scripts Principales
- `./start-complete.sh` - Inicia la aplicación completa (backend + frontend)
- `./setup-universal.sh` - Configuración automática para cualquier máquina
- `./start-vmind.sh` - Script de inicio generado por setup-universal.sh

### Scripts de Desarrollo
```bash
# Frontend
npm run dev          # Servidor de desarrollo Vite
npm run build        # Construir para producción
npm run preview      # Vista previa de producción

# Backend
cd backend
npm run dev          # Servidor con nodemon
npm run test:db      # Probar conexión a base de datos
npm run test:api     # Probar endpoints de la API
```

## 🔑 Credenciales de Prueba

### Usuarios de Ejemplo
```
Email: laura@example.com
Contraseña: laura123
Rol: Usuario

Email: carlos@example.com
Contraseña: carlos123
Rol: Administrador
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📊 Base de Datos

### Esquema Principal
- **users** - Información de usuarios
- **roadmaps** - Rutas de aprendizaje
- **levels** - Niveles dentro de los roadmaps
- **tasks** - Tareas específicas
- **user_tasks** - Progreso de usuarios en tareas
- **triumphs** - Logros y recompensas
- **streaks** - Rachas de días activos
- **notes** - Notas personales
- **resources** - Recursos guardados

### Datos de Ejemplo
El sistema incluye datos de ejemplo para pruebas:
- 2 usuarios (Laura y Carlos)
- 2 roadmaps (Desarrollo Web y Python)
- Tareas y niveles predefinidos
- Logros y estadísticas de ejemplo

## 🔒 Seguridad

- **Autenticación JWT** con refresh tokens
- **Encriptación de contraseñas** con bcryptjs
- **Headers de seguridad** con helmet
- **Rate limiting** para prevenir abuso
- **Validación de datos** en frontend y backend
- **CORS configurado** para desarrollo y producción

## 🚀 Despliegue

### Desarrollo Local
```bash
./start-complete.sh
```

### Producción
```bash
# Construir frontend
npm run build

# Configurar variables de entorno de producción
# Iniciar servidor de producción
cd backend
npm start
```

## 🐛 Solución de Problemas

### Error de Conexión a MySQL
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql

# Verificar credenciales en backend/.env
# Probar conexión manual
mysql -u root -p
```

### Error de Puertos Ocupados
```bash
# Verificar puertos en uso
lsof -i :3000
lsof -i :5173

# Matar procesos si es necesario
kill -9 <PID>
```

### Error de Dependencias
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📝 Changelog

### v2.0.0 - Estabilización
- ✅ Configuración centralizada
- ✅ API service modular
- ✅ Eliminación de datos mock
- ✅ Scripts de configuración universal
- ✅ Corrección de inconsistencias de base de datos
- ✅ Sistema de autenticación unificado

### v1.0.0 - Versión Inicial
- 🎯 Sistema de roadmaps básico
- 🏆 Gamificación inicial
- 📝 Notas y recursos
- 🌟 Interfaz espacial

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- 📧 Email: soporte@vmind.com
- 📖 Documentación: [Wiki del proyecto]
- 🐛 Issues: [GitHub Issues]

---

**¡Disfruta aprendiendo con V-Mind! 🚀✨**
