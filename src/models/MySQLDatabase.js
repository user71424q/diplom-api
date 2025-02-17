const mysql = require('mysql2/promise');

class MySQLDatabase {
  /**
   * Конструктор, принимает конфигурацию подключения.
   * @param {object} config - Конфигурация подключения к MySQL.
   */
  constructor(config) {
    this.pool = mysql.createPool(config);
  }

  /**
   * Выполняет SQL-запрос с указанными параметрами через пул соединений.
   * @param {string} query - SQL-запрос.
   * @param {Array} params - Параметры для запроса.
   * @returns {Promise<any>} Результат запроса.
   */
  async query(query, params) {
    const [rows] = await this.pool.query(query, params);
    return rows;
  }
}

module.exports = MySQLDatabase;
