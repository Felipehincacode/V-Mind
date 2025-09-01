#!/bin/bash

# ===== SCRIPT DE CONFIGURACIÓN DE VMIND =====

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}    CONFIGURACIÓN DE VMIND${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar Node.js
check_nodejs() {
    print_message "Verificando Node.js..."
    
    if ! command_exists node; then
        print_error "Node.js no está instalado"
        print_message "Por favor instala Node.js desde https://nodejs.org/"
        print_message "Versión recomendada: 16.x o superior"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_warning "Node.js versión $NODE_VERSION detectada"
        print_message "Se recomienda Node.js 16.x o superior"
    else
        print_message "✅ Node.js $(node -v) encontrado"
    fi
}

# Función para verificar npm
check_npm() {
    print_message "Verificando npm..."
    
    if ! command_exists npm; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    print_message "✅ npm $(npm -v) encontrado"
}

# Función para verificar MySQL
check_mysql() {
    print_message "Verificando MySQL..."
    
    if ! command_exists mysql; then
        print_warning "MySQL no está instalado o no está en el PATH"
        print_message "Asegúrate de tener MySQL instalado y ejecutándose"
    else
        print_message "✅ MySQL encontrado"
    fi
}

# Función para instalar dependencias del backend
install_backend_deps() {
    print_message "Instalando dependencias del backend..."
    
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json no encontrado en el directorio backend"
        exit 1
    fi
    
    if npm install; then
        print_message "✅ Dependencias del backend instaladas"
    else
        print_error "❌ Error instalando dependencias del backend"
        exit 1
    fi
    
    cd ..
}

# Función para instalar dependencias del frontend
install_frontend_deps() {
    print_message "Instalando dependencias del frontend..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json no encontrado en el directorio raíz"
        exit 1
    fi
    
    if npm install; then
        print_message "✅ Dependencias del frontend instaladas"
    else
        print_error "❌ Error instalando dependencias del frontend"
        exit 1
    fi
}

# Función para configurar archivo .env
setup_env() {
    print_message "Configurando archivo .env..."
    
    cd backend
    
    if [ ! -f ".env" ]; then
        print_message "Creando archivo .env..."
        cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=vmind
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=vmind_super_secret_jwt_key_$(date +%s)
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
EOF
        print_message "✅ Archivo .env creado"
        print_warning "⚠️  IMPORTANTE: Edita backend/.env y cambia tu contraseña de MySQL"
    else
        print_message "✅ Archivo .env ya existe"
    fi
    
    cd ..
}

# Función para crear base de datos
setup_database() {
    print_message "Configurando base de datos..."
    
    read -p "¿Quieres crear la base de datos ahora? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "Ejecutando script SQL..."
        
        if command_exists mysql; then
            read -p "Ingresa tu contraseña de MySQL (deja vacío si no tienes): " MYSQL_PASSWORD
            
            if [ -z "$MYSQL_PASSWORD" ]; then
                mysql -u root < backend/database/schema-corrected.sql
            else
                mysql -u root -p"$MYSQL_PASSWORD" < backend/database/schema-corrected.sql
            fi
            
            if [ $? -eq 0 ]; then
                print_message "✅ Base de datos creada exitosamente"
            else
                print_error "❌ Error creando la base de datos"
                print_message "Puedes crear la base de datos manualmente ejecutando:"
                print_message "mysql -u root -p < backend/database/schema.sql"
            fi
        else
            print_warning "MySQL no encontrado. Crea la base de datos manualmente:"
            print_message "mysql -u root -p < backend/database/schema.sql"
        fi
    else
        print_message "Omitiendo creación de base de datos"
    fi
}

# Función para probar la configuración
test_setup() {
    print_message "Probando la configuración..."
    
    cd backend
    
    # Probar conexión a la base de datos
    print_message "Probando conexión a la base de datos..."
    if npm run test:db; then
        print_message "✅ Conexión a la base de datos exitosa"
    else
        print_warning "⚠️  Error en la conexión a la base de datos"
        print_message "Verifica tu configuración en .env"
    fi
    
    # Probar API
    print_message "Probando API..."
    if npm run test; then
        print_message "✅ API funcionando correctamente"
    else
        print_warning "⚠️  Error en las pruebas de la API"
    fi
    
    cd ..
}

# Función para mostrar información final
show_final_info() {
    print_header
    print_message "🎉 ¡Configuración completada!"
    echo
    print_message "📋 Próximos pasos:"
    echo
    print_message "1. Edita backend/.env con tu contraseña de MySQL"
    print_message "2. Asegúrate de que MySQL esté ejecutándose"
    print_message "3. Ejecuta: npm run full-dev"
    print_message "4. Ve a http://localhost:5173"
    echo
    print_message "🔑 Credenciales de prueba (después de seed:data):"
    print_message "   juan@example.com / password123"
    print_message "   maria@example.com / password123"
    print_message "   admin@vmind.com / admin123"
    echo
    print_message "📚 Comandos útiles:"
    print_message "   npm run dev          - Solo frontend"
    print_message "   npm run backend      - Solo backend"
    print_message "   npm run full-dev     - Frontend + Backend"
    print_message "   npm run build        - Build de producción"
    echo
    print_message "🐛 Para debugging:"
    print_message "   cd backend && npm run test:db  - Probar base de datos"
    print_message "   cd backend && npm run test     - Probar API"
    print_message "   cd backend && npm run seed:data - Cargar datos de ejemplo"
}

# Función principal
main() {
    print_header
    
    # Verificar requisitos
    check_nodejs
    check_npm
    check_mysql
    
    echo
    
    # Instalar dependencias
    install_backend_deps
    install_frontend_deps
    
    echo
    
    # Configurar entorno
    setup_env
    setup_database
    
    echo
    
    # Probar configuración
    test_setup
    
    echo
    
    # Mostrar información final
    show_final_info
}

# Ejecutar función principal
main "$@"
