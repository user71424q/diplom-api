const express = require('express');
const router = express.Router();

const speechController = require('../controllers/speechController');
// В дальнейшем сюда можно будет подключать остальные контроллеры (auth, sync, progress и т.д.)

// Эндпоинт для озвучивания стихотворения
router.post('/speech', speechController.synthesizeSpeech);

module.exports = router;
