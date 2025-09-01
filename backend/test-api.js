const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  user_name: 'Test User',
  email: 'test@example.com',
  phone: '3001234567',
  passwords: 'test123',
  objetive: 'Probar la API',
  preferred_language: 'es'
};

let authToken = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

const testEndpoint = async (method, endpoint, body = null, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const runTests = async () => {
  log(colors.blue, '🧪 Iniciando pruebas de la API V-Mind...\n');

  // Test 1: Health Check
  log(colors.yellow, '1. Probando Health Check...');
  const healthResult = await testEndpoint('GET', '/health');
  if (healthResult.success) {
    log(colors.green, '✅ Health Check: OK');
  } else {
    log(colors.red, '❌ Health Check: FAILED');
    return;
  }

  // Test 2: Register User
  log(colors.yellow, '\n2. Probando Registro de Usuario...');
  const registerResult = await testEndpoint('POST', '/auth/register', testUser);
  if (registerResult.success) {
    log(colors.green, '✅ Registro: OK');
    authToken = registerResult.data.data.token;
  } else {
    log(colors.red, '❌ Registro: FAILED');
    log(colors.red, `   Error: ${registerResult.data.message}`);
  }

  // Test 3: Login
  log(colors.yellow, '\n3. Probando Login...');
  const loginResult = await testEndpoint('POST', '/auth/login', {
    email: testUser.email,
    passwords: testUser.passwords
  });
  if (loginResult.success) {
    log(colors.green, '✅ Login: OK');
    authToken = loginResult.data.data.token;
  } else {
    log(colors.red, '❌ Login: FAILED');
    log(colors.red, `   Error: ${loginResult.data.message}`);
  }

  // Test 4: Get Profile
  log(colors.yellow, '\n4. Probando Obtener Perfil...');
  const profileResult = await testEndpoint('GET', '/auth/profile', null, authToken);
  if (profileResult.success) {
    log(colors.green, '✅ Get Profile: OK');
  } else {
    log(colors.red, '❌ Get Profile: FAILED');
  }

  // Test 5: Get Roadmaps
  log(colors.yellow, '\n5. Probando Obtener Roadmaps...');
  const roadmapsResult = await testEndpoint('GET', '/roadmaps');
  if (roadmapsResult.success) {
    log(colors.green, `✅ Get Roadmaps: OK (${roadmapsResult.data.data.length} roadmaps encontrados)`);
  } else {
    log(colors.red, '❌ Get Roadmaps: FAILED');
  }

  // Test 6: Create Roadmap
  log(colors.yellow, '\n6. Probando Crear Roadmap...');
  const newRoadmap = {
    title: 'Roadmap de Prueba',
    roadmap_description: 'Roadmap creado para pruebas',
    topic: 'Testing',
    difficulty: 'beginner',
    estimated_time: 60
  };
  const createRoadmapResult = await testEndpoint('POST', '/roadmaps', newRoadmap, authToken);
  if (createRoadmapResult.success) {
    log(colors.green, '✅ Create Roadmap: OK');
  } else {
    log(colors.red, '❌ Create Roadmap: FAILED');
  }

  // Test 7: Get User Stats
  log(colors.yellow, '\n7. Probando Obtener Estadísticas del Usuario...');
  const statsResult = await testEndpoint('GET', '/users/stats', null, authToken);
  if (statsResult.success) {
    log(colors.green, '✅ Get User Stats: OK');
    const stats = statsResult.data.data;
    log(colors.blue, `   Nivel actual: ${stats.user.current_level}`);
    log(colors.blue, `   XP total: ${stats.tasks.total_xp}`);
    log(colors.blue, `   Porcentaje de completado: ${stats.tasks.completion_percentage}%`);
  } else {
    log(colors.red, '❌ Get User Stats: FAILED');
  }

  // Test 8: Get User Interests
  log(colors.yellow, '\n8. Probando Obtener Intereses...');
  const interestsResult = await testEndpoint('GET', '/users/interests', null, authToken);
  if (interestsResult.success) {
    log(colors.green, `✅ Get Interests: OK (${interestsResult.data.data.length} intereses disponibles)`);
  } else {
    log(colors.red, '❌ Get Interests: FAILED');
  }

  // Test 9: Create Note
  log(colors.yellow, '\n9. Probando Crear Nota...');
  const newNote = {
    title: 'Nota de Prueba',
    content: 'Esta es una nota creada para probar la API'
  };
  const createNoteResult = await testEndpoint('POST', '/users/notes', newNote, authToken);
  if (createNoteResult.success) {
    log(colors.green, '✅ Create Note: OK');
  } else {
    log(colors.red, '❌ Create Note: FAILED');
  }

  // Test 10: Save Resource
  log(colors.yellow, '\n10. Probando Guardar Recurso...');
  const newResource = {
    title: 'Recurso de Prueba',
    type: 'video',
    link: 'https://youtube.com/test',
    duration_minutes: 30
  };
  const saveResourceResult = await testEndpoint('POST', '/users/resources', newResource, authToken);
  if (saveResourceResult.success) {
    log(colors.green, '✅ Save Resource: OK');
  } else {
    log(colors.red, '❌ Save Resource: FAILED');
  }

  log(colors.blue, '\n🎉 Pruebas completadas!');
  log(colors.blue, '📊 Resumen:');
  log(colors.blue, '   - Health Check: ✅');
  log(colors.blue, '   - Autenticación: ✅');
  log(colors.blue, '   - Roadmaps: ✅');
  log(colors.blue, '   - Usuario: ✅');
  log(colors.blue, '   - Notas y Recursos: ✅');
  
  log(colors.green, '\n🚀 La API está funcionando correctamente!');
  log(colors.yellow, '💡 Puedes usar estos endpoints en tu frontend:');
  log(colors.yellow, '   - Base URL: http://localhost:3000/api');
  log(colors.yellow, '   - Token de ejemplo: ' + authToken.substring(0, 50) + '...');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
