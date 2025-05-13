const syncDataService = require('../services/syncService');

exports.syncData = async (req, res) => {
  try {
    const { sub, last_sync_id } = req.body;
    
    // Валидация параметров
    if (last_sync_id === undefined || last_sync_id === null || isNaN(Number(last_sync_id))) {
      return res.status(400).json({ error: '"last_sync_id" обязателен и должен быть числом.' });
    }
    if (sub !== null && sub !== undefined && typeof sub !== 'string') {
      return res.status(400).json({ error: '"sub" должно быть строкой или null.' });
    }
    
    // Приводим last_sync_id к числу
    const data = await syncDataService.syncData(sub, Number(last_sync_id));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
