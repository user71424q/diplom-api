const db = require('../config/db'); // Объект доступа к базе (интерфейс Database)
const SyncRepository = require('../models/syncRepository');

// Создаем экземпляр репозитория, передавая в него объект db
const syncRepository = new SyncRepository(db);

/**
 * Получает данные для синхронизации, вызывая репозиторий.
 * @param {string|null} sub - Идентификатор пользователя (или null для анонимного режима).
 * @param {number} last_sync - Последний полученный sync_id.
 * @returns {Promise<{ data: Array, new_sync_id: number }>} Объект, содержащий массив записей для синхронизации и новый sync_id.
 * @throws {Error} Если произошла ошибка синхронизации.
 */
async function syncData(sub, last_sync) {
  try {
    const new_sync_id = (await syncRepository.getNewSyncId()) || 0;
    const data = await syncRepository.getSyncData(sub, last_sync);
    
    return { data, new_sync_id };
  } catch (error) {
    throw new Error(`Ошибка синхронизации: ${error.message}`);
  }
}

module.exports = {
  syncData,
};
