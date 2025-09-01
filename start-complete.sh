#!/bin/bash

# ===== SCRIPT COMPLETO DE INICIO DE VMIND =====

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables globales
MYSQL_USER="root"
MYSQL_PASSWORD=""
DB_NAME="vmind"
BACKEND_PORT=3000
FRONTEND_PORT=5173

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
    echo -e "${BLUE}    INICIANDO VMIND COMPLETO${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar si un puerto está en uso
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Función para obtener contraseña de MySQL
get_mysql_password() {
    if [ -z "$MYSQL_PASSWORD" ]; then
        # Intentar conectar sin contraseña primero
        if mysql -u $MYSQL_USER -e "SELECT 1;" >/dev/null 2>&1; then
            MYSQL_PASSWORD=""
            return 0
        fi
        
        # Intentar con la contraseña conocida
        if mysql -u $MYSQL_USER -p"Qwe.123*" -e "SELECT 1;" >/dev/null 2>&1; then
            MYSQL_PASSWORD="Qwe.123*"
            return 0
        fi
        
        # Si no funciona, pedir al usuario
        read -s -p "Ingresa tu contraseña de MySQL: " MYSQL_PASSWORD
        echo
    fi
}

# Función para verificar MySQL
check_mysql() {
    print_step "Verificando MySQL..."
    
    if ! command_exists mysql; then
        print_error "MySQL no está instalado o no está en el PATH"
        print_message "Por favor instala MySQL y asegúrate de que esté ejecutándose"
        exit 1
    fi
    
    get_mysql_password
    
    # Probar conexión
    if [ -z "$MYSQL_PASSWORD" ]; then
        mysql -u $MYSQL_USER -e "SELECT 1;" >/dev/null 2>&1
    else
        mysql -u $MYSQL_USER -p"$MYSQL_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1
    fi
    
    if [ $? -eq 0 ]; then
        print_message "✅ MySQL conectado exitosamente"
    else
        print_error "❌ No se pudo conectar a MySQL"
        print_message "Verifica que MySQL esté ejecutándose y las credenciales sean correctas"
        exit 1
    fi
}

# Función para crear base de datos
create_database() {
    print_step "Verificando base de datos..."
    
    # Verificar si la base de datos existe
    if [ -z "$MYSQL_PASSWORD" ]; then
        DB_EXISTS=$(mysql -u $MYSQL_USER -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep -c "$DB_NAME")
    else
        DB_EXISTS=$(mysql -u $MYSQL_USER -p"$MYSQL_PASSWORD" -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep -c "$DB_NAME")
    fi
    
    if [ "$DB_EXISTS" -eq 0 ]; then
        print_message "Creando base de datos '$DB_NAME'..."
        
        if [ -z "$MYSQL_PASSWORD" ]; then
            mysql -u $MYSQL_USER < backend/database/schema-corrected.sql
        else
            mysql -u $MYSQL_USER -p"$MYSQL_PASSWORD" < backend/database/schema-corrected.sql
        fi
        
        if [ $? -eq 0 ]; then
            print_message "✅ Base de datos creada exitosamente"
        else
            print_error "❌ Error creando la base de datos"
            exit 1
        fi
    else
        print_message "✅ Base de datos '$DB_NAME' ya existe"
    fi
}

# Función para poblar base de datos
populate_database() {
    print_step "Verificando datos de ejemplo..."
    
    # Verificar si ya hay datos
    if [ -z "$MYSQL_PASSWORD" ]; then
        USER_COUNT=$(mysql -u $MYSQL_USER -D $DB_NAME -e "SELECT COUNT(*) as count FROM users;" 2>/dev/null | tail -n 1)
    else
        USER_COUNT=$(mysql -u $MYSQL_USER -p"$MYSQL_PASSWORD" -D $DB_NAME -e "SELECT COUNT(*) as count FROM users;" 2>/dev/null | tail -n 1)
    fi
    
    if [ "$USER_COUNT" -eq 0 ]; then
        print_message "Poblando base de datos con datos de ejemplo..."
        
        cd backend
        if npm run seed:data; then
            print_message "✅ Base de datos poblada exitosamente"
        else
            print_warning "⚠️  Error poblando la base de datos, pero continuando..."
        fi
        cd ..
    else
        print_message "✅ Base de datos ya tiene datos"
    fi
}

# Función para verificar dependencias
check_dependencies() {
    print_step "Verificando dependencias..."
    
    # Verificar Node.js
    if ! command_exists node; then
        print_error "Node.js no está instalado"
        exit 1
    fi
    
    # Verificar npm
    if ! command_exists npm; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    # Verificar si las dependencias están instaladas
    if [ ! -d "node_modules" ]; then
        print_message "Instalando dependencias del frontend..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        print_message "Instalando dependencias del backend..."
        cd backend
        npm install
        cd ..
    fi
    
    print_message "✅ Dependencias verificadas"
}

# Función para configurar archivo .env
setup_env() {
    print_step "Configurando archivo .env..."
    
    cd backend
    
    if [ ! -f ".env" ]; then
        print_message "Creando archivo .env..."
        cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=$MYSQL_USER
DB_PASSWORD=$MYSQL_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=3306

# Server Configuration
PORT=$BACKEND_PORT
NODE_ENV=development

# JWT Configuration
JWT_SECRET=vmind_super_secret_jwt_key_$(date +%s)
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:$FRONTEND_PORT
EOF
        print_message "✅ Archivo .env creado"
    else
        print_message "✅ Archivo .env ya existe"
    fi
    
    cd ..
}

# Función para verificar puertos
check_ports() {
    print_step "Verificando puertos..."
    
    if port_in_use $BACKEND_PORT; then
        print_warning "⚠️  Puerto $BACKEND_PORT (backend) está en uso"
        read -p "¿Quieres detener el proceso en el puerto $BACKEND_PORT? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
            print_message "✅ Proceso en puerto $BACKEND_PORT detenido"
        fi
    fi
    
    if port_in_use $FRONTEND_PORT; then
        print_warning "⚠️  Puerto $FRONTEND_PORT (frontend) está en uso"
        read -p "¿Quieres detener el proceso en el puerto $FRONTEND_PORT? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
            print_message "✅ Proceso en puerto $FRONTEND_PORT detenido"
        fi
    fi
}

# Función para iniciar servidores
start_servers() {
    print_step "Iniciando servidores..."
    
    # Función para limpiar al salir
    cleanup() {
        echo
        print_message "Deteniendo servidores..."
        kill $BACKEND_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
        print_message "✅ Servidores detenidos"
        exit 0
    }
    
    # Capturar Ctrl+C
    trap cleanup SIGINT
    
    # Iniciar backend
    print_message "🚀 Iniciando backend en puerto $BACKEND_PORT..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Esperar un poco para que el backend se inicie
    sleep 3
    
    # Verificar que el backend esté funcionando
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null; then
        print_message "✅ Backend iniciado correctamente"
    else
        print_warning "⚠️  Backend puede no estar completamente iniciado"
    fi
    
    # Iniciar frontend
    print_message "🎨 Iniciando frontend en puerto $FRONTEND_PORT..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Esperar un poco para que el frontend se inicie
    sleep 3
    
    # Verificar que el frontend esté funcionando
    if curl -s http://localhost:$FRONTEND_PORT >/dev/null; then
        print_message "✅ Frontend iniciado correctamente"
    else
        print_warning "⚠️  Frontend puede no estar completamente iniciado"
    fi
    
    # Mostrar información final
    echo
    print_header
    print_message "🎉 ¡V-Mind está ejecutándose!"
    echo
    print_message "📱 URLs de acceso:"
    print_message "   Frontend: http://localhost:$FRONTEND_PORT"
    print_message "   Backend:  http://localhost:$BACKEND_PORT"
    print_message "   Health:   http://localhost:$BACKEND_PORT/health"
    echo
    print_message "🔑 Credenciales de prueba:"
    print_message "   juan@example.com / password123"
    print_message "   maria@example.com / password123"
    print_message "   admin@vmind.com / admin123"
    echo
    print_message "🛑 Presiona Ctrl+C para detener los servidores"
    echo
    
    # Mantener el script ejecutándose
    wait
}

# Función principal
main() {
    print_header
    
    # Verificar dependencias
    check_dependencies
    
    # Verificar MySQL
    check_mysql
    
    # Configurar entorno
    setup_env
    
    # Crear base de datos
    create_database
    
    # Poblar base de datos
    populate_database
    
    # Verificar puertos
    check_ports
    
    # Iniciar servidores
    start_servers
}

# Ejecutar función principal
main "$@"
