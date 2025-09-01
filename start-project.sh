#!/bin/bash

echo "========================================"
echo "    CONFIGURACION RAPIDA DE VMIND"
echo "========================================"
echo

echo "[1/5] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js encontrado"

echo
echo "[2/5] Instalando dependencias del backend..."
cd backend
if ! npm install; then
    echo "ERROR: No se pudieron instalar las dependencias del backend"
    exit 1
fi
echo "✅ Dependencias del backend instaladas"

echo
echo "[3/5] Instalando dependencias del frontend..."
cd ../frontend
if ! npm install; then
    echo "ERROR: No se pudieron instalar las dependencias del frontend"
    exit 1
fi
echo "✅ Dependencias del frontend instaladas"

echo
echo "[4/5] Verificando archivo .env..."
cd ../backend
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "Creando archivo .env con configuración por defecto..."
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
JWT_SECRET=vmind_super_secret_jwt_key_2024
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
EOF
    echo
    echo "⚠️  IMPORTANTE: Edita el archivo backend/.env y cambia tu contraseña de MySQL"
    echo
else
    echo "✅ Archivo .env encontrado"
fi

echo
echo "[5/5] Iniciando servidores..."
echo
echo "🚀 Iniciando backend en http://localhost:3000"
echo "🎨 Iniciando frontend en http://localhost:5173"
echo
echo "Presiona Ctrl+C para detener los servidores"
echo

# Iniciar backend en background
cd ../backend
npm run dev &
BACKEND_PID=$!

# Esperar un poco y luego iniciar frontend
sleep 3
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "    ¡CONFIGURACION COMPLETADA!"
echo "========================================"
echo
echo "📋 Próximos pasos:"
echo "1. Asegúrate de que MySQL esté ejecutándose"
echo "2. Ejecuta el script SQL para crear la base de datos"
echo "3. Edita backend/.env con tu contraseña de MySQL"
echo "4. Ejecuta: cd backend && npm run test:db"
echo "5. Ejecuta: cd backend && npm run seed:data"
echo "6. Ve a http://localhost:5173 para usar la aplicación"
echo
echo "🔑 Credenciales de prueba (después de seed:data):"
echo "   juan@example.com / password123"
echo "   maria@example.com / password123"
echo "   admin@vmind.com / admin123"
echo

# Función para limpiar al salir
cleanup() {
    echo
    echo "Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Mantener el script ejecutándose
wait
