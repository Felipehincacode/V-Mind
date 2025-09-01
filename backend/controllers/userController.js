const { pool } = require('../config/database');

// ===== ESTADÍSTICAS DEL USUARIO =====

const getUserStats = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Obtener datos del usuario
        const [userRows] = await pool.execute(
            'SELECT user_id, user_name, email, current_level, creation_date FROM users WHERE user_id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = userRows[0];

        // Obtener estadísticas de tareas
        const [taskStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                SUM(CASE WHEN status = 'completed' THEN xp_reward ELSE 0 END) as total_xp
            FROM user_tasks ut
            JOIN tasks t ON ut.task_id = t.task_id
            WHERE ut.user_id = ?
        `, [userId]);

        // Obtener racha actual
        const [streakRows] = await pool.execute(
            'SELECT current_streak_days, longest_streak_days FROM streaks WHERE user_id = ?',
            [userId]
        );

        const streak = streakRows.length > 0 ? streakRows[0] : { current_streak_days: 0, longest_streak_days: 0 };

        // Calcular porcentaje de completado
        const stats = taskStats[0];
        const completionPercentage = stats.total_tasks > 0 ? 
            Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0;

        res.json({
            success: true,
            data: {
                user: {
                    user_id: user.user_id,
                    user_name: user.user_name,
                    email: user.email,
                    current_level: user.current_level,
                    creation_date: user.creation_date
                },
                tasks: {
                    total: stats.total_tasks,
                    completed: stats.completed_tasks,
                    in_progress: stats.in_progress_tasks,
                    pending: stats.pending_tasks,
                    total_xp: stats.total_xp || 0,
                    completion_percentage: completionPercentage
                },
                streak: {
                    current_streak_days: streak.current_streak_days,
                    longest_streak_days: streak.longest_streak_days
                }
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas del usuario',
            error: error.message
        });
    }
};

// ===== INTERESES DEL USUARIO =====

const getUserInterests = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [interests] = await pool.execute(`
            SELECT i.interest_id, i.name, il.knowledge_level
            FROM interests i
            LEFT JOIN interest_levels il ON i.interest_id = il.interest_id AND il.user_id = ?
            ORDER BY i.name
        `, [userId]);

        res.json({
            success: true,
            data: interests
        });

    } catch (error) {
        console.error('Get user interests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo intereses del usuario',
            error: error.message
        });
    }
};

// ===== NOTAS DEL USUARIO =====

const getNotes = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [notes] = await pool.execute(
            'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
            [userId]
        );

        res.json({
            success: true,
            data: notes
        });

    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo notas',
            error: error.message
        });
    }
};

const createNote = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Título y contenido son requeridos'
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
            [userId, title, content]
        );

        const [newNote] = await pool.execute(
            'SELECT * FROM notes WHERE note_id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Nota creada exitosamente',
            data: newNote[0]
        });

    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando nota',
            error: error.message
        });
    }
};

const updateNote = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { noteId } = req.params;
        const { title, content } = req.body;

        // Verificar que la nota pertenece al usuario
        const [existingNote] = await pool.execute(
            'SELECT * FROM notes WHERE note_id = ? AND user_id = ?',
            [noteId, userId]
        );

        if (existingNote.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nota no encontrada'
            });
        }

        await pool.execute(
            'UPDATE notes SET title = ?, content = ?, updated_at = NOW() WHERE note_id = ?',
            [title, content, noteId]
        );

        const [updatedNote] = await pool.execute(
            'SELECT * FROM notes WHERE note_id = ?',
            [noteId]
        );

        res.json({
            success: true,
            message: 'Nota actualizada exitosamente',
            data: updatedNote[0]
        });

    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando nota',
            error: error.message
        });
    }
};

const deleteNote = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { noteId } = req.params;

        // Verificar que la nota pertenece al usuario
        const [existingNote] = await pool.execute(
            'SELECT * FROM notes WHERE note_id = ? AND user_id = ?',
            [noteId, userId]
        );

        if (existingNote.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nota no encontrada'
            });
        }

        await pool.execute(
            'DELETE FROM notes WHERE note_id = ?',
            [noteId]
        );

        res.json({
            success: true,
            message: 'Nota eliminada exitosamente'
        });

    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando nota',
            error: error.message
        });
    }
};

// ===== RECURSOS DEL USUARIO =====

const getResources = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [resources] = await pool.execute(
            'SELECT * FROM resources WHERE user_id = ? ORDER BY date_saved DESC',
            [userId]
        );

        res.json({
            success: true,
            data: resources
        });

    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo recursos',
            error: error.message
        });
    }
};

const createResource = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { title, type, link, duration_minutes } = req.body;

        if (!title || !type || !link) {
            return res.status(400).json({
                success: false,
                message: 'Título, tipo y enlace son requeridos'
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO resources (user_id, title, type, link, duration_minutes) VALUES (?, ?, ?, ?, ?)',
            [userId, title, type, link, duration_minutes]
        );

        const [newResource] = await pool.execute(
            'SELECT * FROM resources WHERE resource_id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Recurso guardado exitosamente',
            data: newResource[0]
        });

    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error guardando recurso',
            error: error.message
        });
    }
};

const updateResource = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { resourceId } = req.params;
        const { title, type, link, duration_minutes } = req.body;

        // Verificar que el recurso pertenece al usuario
        const [existingResource] = await pool.execute(
            'SELECT * FROM resources WHERE resource_id = ? AND user_id = ?',
            [resourceId, userId]
        );

        if (existingResource.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recurso no encontrado'
            });
        }

        await pool.execute(
            'UPDATE resources SET title = ?, type = ?, link = ?, duration_minutes = ? WHERE resource_id = ?',
            [title, type, link, duration_minutes, resourceId]
        );

        const [updatedResource] = await pool.execute(
            'SELECT * FROM resources WHERE resource_id = ?',
            [resourceId]
        );

        res.json({
            success: true,
            message: 'Recurso actualizado exitosamente',
            data: updatedResource[0]
        });

    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando recurso',
            error: error.message
        });
    }
};

const deleteResource = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { resourceId } = req.params;

        // Verificar que el recurso pertenece al usuario
        const [existingResource] = await pool.execute(
            'SELECT * FROM resources WHERE resource_id = ? AND user_id = ?',
            [resourceId, userId]
        );

        if (existingResource.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recurso no encontrado'
            });
        }

        await pool.execute(
            'DELETE FROM resources WHERE resource_id = ?',
            [resourceId]
        );

        res.json({
            success: true,
            message: 'Recurso eliminado exitosamente'
        });

    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando recurso',
            error: error.message
        });
    }
};

module.exports = {
    getUserStats,
    getUserInterests,
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    getResources,
    createResource,
    updateResource,
    deleteResource
};
