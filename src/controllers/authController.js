const progressService = require('../services/progressService.js');

exports.vk = async (req, res, next) => {
  try {
    const { sub, user_name } = req.body;
    console.log('VK auth request:', { sub, user_name });

    if (!sub || typeof sub !== 'string') {
      return res.status(400).json({ error: 'Параметр "sub" обязателен и должен быть строкой.' });
    }
    if (!user_name || typeof user_name !== 'string') {
      return res.status(400).json({ error: 'Параметр "user_name" обязателен и должен быть строкой.' });
    }

    await progressService.createUser(req.body);
    return res.status(200).json({ message: 'Данные пользователя успешно обновлены.' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервиса' });
  }
}