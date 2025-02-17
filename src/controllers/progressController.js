const progressService = require('../services/progressService.js');

/**
 * Обрабатывает запрос на обновление прогресса (таблица Scores).
 * Ожидает в теле запроса:
 * {
 *   sub: "идентификатор пользователя (строка)",
 *   data: { ... } // JSON-данные для вставки/обновления в таблицу Scores (без ID)
 * }
 */
exports.submitStats = async (req, res, next) => {
  try {
    const { sub, data } = req.body;
    
    if (!sub || typeof sub !== 'string') {
      return res.status(400).json({ error: 'Параметр "sub" обязателен и должен быть строкой.' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Параметр "data" обязателен и должен быть объектом.' });
    }
    
    await progressService.submitStats(sub, data);
    return res.status(200).json({ message: 'Данные о прогрессе успешно обновлены.' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервиса' });
  }
};

/**
 * Обрабатывает запрос на обновление избранного (таблица Favorites).
 * Ожидает в теле запроса:
 * {
 *   sub: "идентификатор пользователя (строка)",
 *   data: { ... } // JSON-данные для вставки/обновления в таблицу Favorites (без ID)
 * }
 */
exports.submitFavorites = async (req, res, next) => {
  try {
    const { sub, data } = req.body;
    
    if (!sub || typeof sub !== 'string') {
      return res.status(400).json({ error: 'Параметр "sub" обязателен и должен быть строкой.' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Параметр "data" обязателен и должен быть объектом.' });
    }
    
    await progressService.submitFavorites(sub, data);
    return res.status(200).json({ message: 'Избранное успешно обновлено.' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервиса' });
  }
};

/**
 * Обрабатывает запрос на обновление пользовательских данных (таблица Users).
 * Ожидает в теле запроса:
 * {
 *   sub: "идентификатор пользователя (строка)",
 *   data: { ... } // JSON-данные для обновления в таблице Users (без ID)
 * }
 */
exports.updateUserData = async (req, res, next) => {
  try {
    const { sub, data } = req.body;
    
    if (!sub || typeof sub !== 'string') {
      return res.status(400).json({ error: 'Параметр "sub" обязателен и должен быть строкой.' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Параметр "data" обязателен и должен быть объектом.' });
    }
    
    await progressService.updateUserData(sub, data);
    return res.status(200).json({ message: 'Данные пользователя успешно обновлены.' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервиса' });
  }
};
