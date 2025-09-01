#!/bin/bash

# ===== SCRIPT UNIVERSAL DE CONFIGURACIÓN VMIND =====
# Este script configura V-Mind en cualquier máquina

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}    CONFIGURACIÓN UNIVERSAL VMIND${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

# Función para detectar el sistema operativo
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    echo $OS
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para instalar dependencias según el OS
install_dependencies() {
    local os=$(detect_os)
    
    print_step "Instalando dependencias para $os..."
    
    case $os in
        "linux")
            install_linux_dependencies
            ;;
        "macos")
            install_macos_dependencies
            ;;
        "windows")
            install_windows_dependencies
            ;;
        *)
            print_error "Sistema operativo no soportado: $os"
            exit 1
            ;;
    esac
}

install_linux_dependencies() {
    print_message "Detectado: Linux"
    
    # Detectar distribución
    if command_exists apt-get; then
        # Ubuntu/Debian
        print_message "Instalando dependencias con apt-get..."
        sudo apt-get update
        sudo apt-get install -y nodejs npm mysql-server curl wget git
    elif command_exists yum; then
        # CentOS/RHEL/Fedora
        print_message "Instalando dependencias con yum..."
        sudo yum install -y nodejs npm mysql-server curl wget git
    elif command_exists dnf; then
        # Fedora (nuevo)
        print_message "Instalando dependencias con dnf..."
        sudo dnf install -y nodejs npm mysql-server curl wget git
    elif command_exists pacman; then
        # Arch Linux
        print_message "Instalando dependencias con pacman..."
        sudo pacman -S --noconfirm nodejs npm mysql curl wget git
    else
        print_error "No se pudo detectar el gestor de paquetes"
        print_message "Por favor instala manualmente: Node.js, npm, MySQL, curl, wget, git"
        exit 1
    fi
}

install_macos_dependencies() {
    print_message "Detectado: macOS"
    
    if ! command_exists brew; then
        print_message "Instalando Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    print_message "Instalando dependencias con Homebrew..."
    brew install node mysql curl wget git
}

install_windows_dependencies() {
    print_message "Detectado: Windows"
    print_warning "Para Windows, por favor instala manualmente:"
    print_message "1. Node.js desde: https://nodejs.org/"
    print_message "2. MySQL desde: https://dev.mysql.com/downloads/"
    print_message "3. Git desde: https://git-scm.com/"
    print_message "4. WSL2 para mejor experiencia (opcional)"
}

# Función para configurar MySQL
setup_mysql() {
    print_step "Configurando MySQL..."
    
    # Verificar si MySQL está ejecutándose
    if ! pgrep -x "mysqld" > /dev/null; then
        print_message "Iniciando MySQL..."
        if [[ "$(detect_os)" == "macos" ]]; then
            brew services start mysql
        else
            sudo systemctl start mysql
            sudo systemctl enable mysql
        fi
    fi
    
    # Configurar contraseña de root
    print_message "Configurando contraseña de MySQL..."
    read -s -p "Ingresa la contraseña para el usuario root de MySQL: " MYSQL_ROOT_PASSWORD
    echo
    
    # Intentar configurar la contraseña
    mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '$MYSQL_ROOT_PASSWORD';" 2>/dev/null || {
        print_warning "No se pudo cambiar la contraseña. MySQL puede estar configurado con autenticación socket."
    }
    
    # Crear usuario específico para V-Mind
    print_message "Creando usuario específico para V-Mind..."
    read -s -p "Ingresa la contraseña para el usuario vmind: " VMIND_DB_PASSWORD
    echo
    
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "
        CREATE USER IF NOT EXISTS 'vmind'@'localhost' IDENTIFIED BY '$VMIND_DB_PASSWORD';
        GRANT ALL PRIVILEGES ON vmind.* TO 'vmind'@'localhost';
        FLUSH PRIVILEGES;
    " 2>/dev/null || {
        print_warning "No se pudo crear el usuario vmind. Usando root."
        VMIND_DB_PASSWORD="$MYSQL_ROOT_PASSWORD"
    }
    
    # Guardar configuración
    echo "MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD" > .env.mysql
    echo "VMIND_DB_PASSWORD=$VMIND_DB_PASSWORD" >> .env.mysql
    chmod 600 .env.mysql
}

# Función para instalar dependencias de Node.js
install_node_dependencies() {
    print_step "Instalando dependencias de Node.js..."
    
    # Instalar dependencias del frontend
    print_message "Instalando dependencias del frontend..."
    npm install
    
    # Instalar dependencias del backend
    print_message "Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
}

# Función para configurar archivos de entorno
setup_environment() {
    print_step "Configurando archivos de entorno..."
    
    # Cargar configuración de MySQL si existe
    if [ -f .env.mysql ]; then
        source .env.mysql
    fi
    
    # Configurar .env del backend
    if [ ! -f backend/.env ]; then
        cp backend/env.example backend/.env
    fi
    
    # Actualizar configuración del backend
    if [ ! -z "$VMIND_DB_PASSWORD" ]; then
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$VMIND_DB_PASSWORD/" backend/.env
    fi
    
    # Configurar .env del frontend si es necesario
    if [ ! -f frontend/.env ]; then
        cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=V-Mind
VITE_APP_VERSION=2.0.0
EOF
    fi
}

# Función para crear la base de datos
setup_database() {
    print_step "Configurando base de datos..."
    
    # Cargar configuración de MySQL
    if [ -f .env.mysql ]; then
        source .env.mysql
    fi
    
    # Crear base de datos
    if [ ! -z "$VMIND_DB_PASSWORD" ]; then
        mysql -u vmind -p"$VMIND_DB_PASSWORD" < backend/database/schema-corrected.sql
    elif [ ! -z "$MYSQL_ROOT_PASSWORD" ]; then
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" < backend/database/schema-corrected.sql
    else
        mysql -u root < backend/database/schema-corrected.sql
    fi
    
    print_message "✅ Base de datos creada exitosamente"
}

# Función para crear scripts de inicio
create_startup_scripts() {
    print_step "Creando scripts de inicio..."
    
    # Script para Linux/macOS
    cat > start-vmind.sh << 'EOF'
#!/bin/bash
# Script de inicio para V-Mind

# Cargar configuración de MySQL
if [ -f .env.mysql ]; then
    source .env.mysql
fi

# Variables de configuración
MYSQL_USER=${VMIND_DB_USER:-vmind}
MYSQL_PASSWORD=${VMIND_DB_PASSWORD:-$MYSQL_ROOT_PASSWORD}
DB_NAME=vmind

echo "🚀 Iniciando V-Mind..."

# Verificar MySQL
if ! mysql -u $MYSQL_USER -p"$MYSQL_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ Error: No se puede conectar a MySQL"
    exit 1
fi

# Iniciar backend
echo "🔧 Iniciando backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
sleep 3

# Iniciar frontend
echo "🎨 Iniciando frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ V-Mind iniciado correctamente"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3000"
echo "🛑 Presiona Ctrl+C para detener"

# Esperar señal de interrupción
trap "echo 'Deteniendo servidores...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

    chmod +x start-vmind.sh
    
    # Script para Windows (si es necesario)
    cat > start-vmind.bat << 'EOF'
@echo off
echo 🚀 Iniciando V-Mind...

REM Iniciar backend
echo 🔧 Iniciando backend...
cd backend
start "V-Mind Backend" npm run dev
cd ..

REM Esperar un momento
timeout /t 3 /nobreak >nul

REM Iniciar frontend
echo 🎨 Iniciando frontend...
start "V-Mind Frontend" npm run dev

echo ✅ V-Mind iniciado correctamente
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3000
echo 🛑 Cierra las ventanas para detener

pause
EOF
}

# Función para verificar la instalación
verify_installation() {
    print_step "Verificando instalación..."
    
    # Verificar Node.js
    if command_exists node; then
        print_message "✅ Node.js: $(node --version)"
    else
        print_error "❌ Node.js no está instalado"
    fi
    
    # Verificar npm
    if command_exists npm; then
        print_message "✅ npm: $(npm --version)"
    else
        print_error "❌ npm no está instalado"
    fi
    
    # Verificar MySQL
    if command_exists mysql; then
        print_message "✅ MySQL: $(mysql --version | head -n1)"
    else
        print_error "❌ MySQL no está instalado"
    fi
    
    # Verificar Git
    if command_exists git; then
        print_message "✅ Git: $(git --version)"
    else
        print_error "❌ Git no está instalado"
    fi
}

# Función principal
main() {
    print_header
    
    # Detectar sistema operativo
    OS=$(detect_os)
    print_message "Sistema operativo detectado: $OS"
    
    # Instalar dependencias
    install_dependencies
    
    # Verificar instalación
    verify_installation
    
    # Configurar MySQL
    setup_mysql
    
    # Instalar dependencias de Node.js
    install_node_dependencies
    
    # Configurar entorno
    setup_environment
    
    # Configurar base de datos
    setup_database
    
    # Crear scripts de inicio
    create_startup_scripts
    
    print_message "🎉 ¡Configuración completada!"
    print_message ""
    print_message "📋 Para iniciar V-Mind:"
    print_message "   Linux/macOS: ./start-vmind.sh"
    print_message "   Windows: start-vmind.bat"
    print_message ""
    print_message "🔑 Credenciales de prueba:"
    print_message "   Email: laura@example.com"
    print_message "   Contraseña: laura123"
    print_message ""
    print_message "📚 Documentación: README.md"
}

# Ejecutar función principal
main "$@"
