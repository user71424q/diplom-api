const db = require('../config/db');
const SyncRepository = require('../models/syncRepository');

// Создаем экземпляр репозитория, который используется для всех операций синхронизации
const progressRepository = new SyncRepository(db);

/**
 * Обновляет прогресс пользователя (таблица Scores).
 * @param {string} sub - Идентификатор пользователя.
 * @param {Object} data - Объект данных для вставки в таблицу Scores.
 * @returns {Promise<void>}
 */
async function submitStats(sub, data) {
  try {
    const userId = await progressRepository.getUserIdBySub(sub);
    if (!userId) throw new Error(`Пользователь с sub=${sub} не найден.`);
    
    await progressRepository.insertScore(userId, data);
  } catch (error) {
    console.error(`Ошибка при обновлении прогресса пользователя: ${error.message}`);
    throw new Error(`Ошибка обновления прогресса: ${error.message}`);
  }
}

/**
 * Обновляет избранное пользователя (таблица Favorites).
 * @param {string} sub - Идентификатор пользователя.
 * @param {Object} data - Объект данных для вставки в таблицу Favorites.
 * @returns {Promise<void>}
 */
async function submitFavorites(sub, data, delete_=false) {
  try {
    const userId = await progressRepository.getUserIdBySub(sub);
    if (!userId) throw new Error(`Пользователь с sub=${sub} не найден.`);
    if (delete_) {
      await progressRepository.deleteFavorite(userId, data.poem_id);
    }
    else {
      await progressRepository.insertFavorite(userId, data.poem_id);
    }
  } catch (error) {
    console.error(`Ошибка при обновлении избранного: ${error.message}`);
    throw new Error(`Ошибка обновления избранного: ${error.message}`);
  }
}


/**
 * Обновляет данные пользователя (таблица Users).
 * @param {string} sub - Идентификатор пользователя.
 * @param {Object} data - Объект данных для обновления в таблице Users.
 * @returns {Promise<void>}
 */
async function updateUserData(sub, data) {
  try {
    const userId = await progressRepository.getUserIdBySub(sub);
    if (!userId) throw new Error(`Пользователь с sub=${sub} не найден.`);
    
    await progressRepository.updateUserData(userId, data);
  } catch (error) {
    console.error(`Ошибка при обновлении данных пользователя: ${error.message}`);
    throw new Error(`Ошибка обновления данных пользователя: ${error.message}`);
  }
}

async function createUser(data) {
  try {
    await progressRepository.createUser(data);
  } catch (error) {
    console.error(`Ошибка при создании пользователя: ${error.message}`);
    throw new Error(`Ошибка создания пользователя: ${error.message}`);
  }
}

module.exports = {
  submitStats,
  submitFavorites,
  updateUserData,
  createUser,
};
