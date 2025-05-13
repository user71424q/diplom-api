class SyncRepository {
  /**
   * Конструктор получает объект подключения к базе, реализующий метод query().
   * @param {object} db - Объект доступа к базе.
   */
  constructor(db) {
      this.db = db;
  }

  /**
   * Получает user_id по sub.
   * @param {string} sub - Уникальный идентификатор пользователя (альтернативный ключ).
   * @returns {Promise<number|null>} user_id или null, если пользователь не найден.
   */
  async getUserIdBySub(sub) {
      const [result] = await this.db.query('SELECT COALESCE((SELECT user_id FROM Users WHERE sub = ? LIMIT 1), NULL) AS user_id', [sub]);
      return result.user_id;
  }

  /**
   * Вызывает хранимую процедуру sp_sync_data с параметрами sub и last_sync.
   * @param {string|null} sub - Идентификатор пользователя или null для анонимного режима.
   * @param {number} last_sync - Последний полученный sync_id.
   * @returns {Promise<Array>} Массив записей из SyncLog.
   */
  async getSyncData(sub, last_sync) {
      const [result] = await this.db.query('CALL sp_sync_data(?, ?)', [sub, last_sync]);
      return result;
  }

  /**
   * Возвращает максимальный sync_id из SyncLog.
   * @returns {Promise<number>} Новый sync_id.
   */
  async getNewSyncId() {
      const [result] = await this.db.query('SELECT MAX(sync_id) AS sync_id FROM SyncLog');
      return result.sync_id;
  }

  /**
   * Вставляет запись о прогрессе пользователя в таблицу Scores.
   * @param {number} userId - ID пользователя.
   * @param {object} score - Данные для вставки (poem_id, score_time, score_grade, difficulty, level).
   * @returns {Promise<void>}
   */
  async insertScore(userId, score) {
      await this.db.query(
          'INSERT INTO Scores (poem_id, user_id, score_time, score_grade, difficulty, level) VALUES (?, ?, ?, ?, ?, ?)',
          [score.poem_id, userId, score.score_time, score.score_grade, score.difficulty, score.level]
      );
  }

  /**
   * Вставляет запись об избранном стихотворении в таблицу Favorites.
   * @param {number} userId - ID пользователя.
   * @param {number} poemId - ID стихотворения.
   * @returns {Promise<void>}
   */
  async insertFavorite(userId, poemId) {
      await this.db.query(
          'INSERT INTO Favorites (user_id, poem_id) VALUES (?, ?)',
          [userId, poemId]
      );
  }

  /**
   * Удаляет запись об избранном стихотворении из таблицы Favorites.
   * @param {number} userId - ID пользователя.
   * @param {number} poemId - ID стихотворения.
   * @returns {Promise<void>}
   */
    async deleteFavorite(userId, poemId) {
        await this.db.query(
            'DELETE FROM Favorites WHERE user_id = ? AND poem_id = ?',
            [userId, poemId]
        );
    }



  /**
   * Обновляет данные пользователя в таблице Users.
   * @param {number} userId - ID пользователя.
   * @param {Object} userData - Объект с обновляемыми данными (user_name и другие поля).
   * @returns {Promise<void>}
   */
  async updateUserData(userId, userData) {
      await this.db.query(
          'UPDATE Users SET ? WHERE user_id = ?',
          [userData, userId]
      );
  }

    /**
     * Создает пользователя в таблице Users, если не существует, и возвращает user_id.
     * @param {Object} userData - Данные пользователя (sub, user_name).
     * @returns {Promise<number>} ID пользователя.
     */
    async createUser(userData) {
        // Вставляем пользователя по sub и user_name, если такого нет
        await this.db.query(
            'INSERT INTO Users (sub, user_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_name = VALUES(user_name)',
            [userData.sub, userData.user_name]
        );
        // Получаем user_id по sub
        const [result] = await this.db.query(
            'SELECT user_id FROM Users WHERE sub = ? LIMIT 1',
            [userData.sub]
        );
        return result.user_id;
    }
}

module.exports = SyncRepository;
