const { pool } = require('./config/database');

async function testDatabaseConnection() {
    try {
        console.log('🔍 Probando conexión con la base de datos...');
        
        // Probar conexión básica
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL');
        
        // Verificar que la base de datos existe
        const [databases] = await connection.execute('SHOW DATABASES LIKE "vmind"');
        if (databases.length === 0) {
            console.log('❌ La base de datos "vmind" no existe');
            console.log('📝 Ejecuta el script SQL para crear la base de datos');
            return;
        }
        console.log('✅ Base de datos "vmind" encontrada');
        
        // Verificar tablas
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Tablas encontradas:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });
        
        // Verificar estructura de tabla users
        const [userColumns] = await connection.execute('DESCRIBE users');
        console.log('\n👤 Estructura de tabla users:');
        userColumns.forEach(column => {
            console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : ''}`);
        });
        
        // Verificar estructura de tabla roadmaps
        const [roadmapColumns] = await connection.execute('DESCRIBE roadmaps');
        console.log('\n🗺️ Estructura de tabla roadmaps:');
        roadmapColumns.forEach(column => {
            console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : ''}`);
        });
        
        // Verificar estructura de tabla tasks
        const [taskColumns] = await connection.execute('DESCRIBE tasks');
        console.log('\n✅ Estructura de tabla tasks:');
        taskColumns.forEach(column => {
            console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : ''}`);
        });
        
        // Contar registros en cada tabla
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [roadmapCount] = await connection.execute('SELECT COUNT(*) as count FROM roadmaps');
        const [taskCount] = await connection.execute('SELECT COUNT(*) as count FROM tasks');
        
        console.log('\n📊 Estadísticas de la base de datos:');
        console.log(`   - Usuarios: ${userCount[0].count}`);
        console.log(`   - Roadmaps: ${roadmapCount[0].count}`);
        console.log(`   - Tareas: ${taskCount[0].count}`);
        
        connection.release();
        console.log('\n🎉 Todas las pruebas pasaron exitosamente!');
        
    } catch (error) {
        console.error('❌ Error al probar la base de datos:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('   1. Verifica que MySQL esté ejecutándose');
        console.log('   2. Verifica las credenciales en el archivo .env');
        console.log('   3. Asegúrate de que la base de datos "vmind" exista');
        console.log('   4. Ejecuta el script SQL para crear las tablas');
    }
}

// Ejecutar la prueba
testDatabaseConnection();
