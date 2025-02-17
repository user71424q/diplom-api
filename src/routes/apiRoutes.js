const express = require('express');
const router = express.Router();

const speechController = require('../controllers/speechController');
// const authController = require('../controllers/authController');
const syncController = require('../controllers/syncController');
const progressController = require('../controllers/progressController');

// Эндпоинты авторизации (Google)
// router.post('/auth/google', authController.googleAuth);

// Эндпоинт для озвучивания стихотворения
router.post('/speech', speechController.synthesizeSpeech);

// Эндпоинт синхронизации (возвращает изменения из SyncLog)
router.post('/sync', syncController.syncData);

// Эндпоинты для обновления пользовательских данных:
// - Обновление прогресса (Scores)
router.post('/sync/stats', progressController.submitStats);
// - Обновление избранного (Favorites)
router.post('/sync/favorites', progressController.submitFavorites);
// - Обновление данных пользователя (Users)
router.post('/sync/users', progressController.updateUserData);

module.exports = router;
