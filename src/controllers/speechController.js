const speechService = require('../services/speechService');

exports.synthesizeSpeech = async (req, res, next) => {
  try {
    // Извлекаем текст, голос и формат из тела запроса
    const { text, voice, format } = req.body;

    // Валидация входных данных
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Поле "text" обязательно и должно быть строкой.' });
    }
    if (voice && typeof voice !== 'string') {
      return res.status(400).json({ error: 'Поле "voice", если задано, должно быть строкой.' });
    }
    if (format) {
      if (typeof format !== 'string') {
        return res.status(400).json({ error: 'Поле "format", если задано, должно быть строкой.' });
      }
      if (!['opus', 'wav16'].includes(format)) {
        return res.status(400).json({ error: 'Поле "format" должно быть либо "opus", либо "wav16".' });
      }
    }

    // Вызываем сервис синтеза речи
    const response = await speechService.synthesizeSpeech({ text, voice, format });

    // Получаем Content-Type из ответа API
    const contentType = response.headers['content-type'] || 'application/octet-stream';

    // Устанавливаем заголовки
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="speech.${format}"`);

    // Отправляем бинарные данные клиенту
    return res.send(response.data);
  } catch (error) {
    // Если ошибка связана с внешним API — возвращаем 503 Service Unavailable
    if (error.message.includes('SaluteSpeech API недоступен') || error.message.includes('Ошибка при синтезе речи')) {
      return res.status(503).json({ error: 'Внешний сервис временно недоступен. Попробуйте позже.' });
    }

    // Если ошибка другая, передаем ее дальше в middleware обработки ошибок
    next(error);
  }
};
