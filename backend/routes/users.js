const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Importar controladores (los crearemos después)
const { 
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
} = require('../controllers/userController');

// Rutas protegidas (requieren autenticación)
router.use(auth);

// Estadísticas del usuario
router.get('/stats', getUserStats);

// Intereses del usuario
router.get('/interests', getUserInterests);

// Notas del usuario
router.get('/notes', getNotes);
router.post('/notes', createNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);

// Recursos del usuario
router.get('/resources', getResources);
router.post('/resources', createResource);
router.put('/resources/:resourceId', updateResource);
router.delete('/resources/:resourceId', deleteResource);

module.exports = router;
