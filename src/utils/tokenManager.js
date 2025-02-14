const axios = require('axios');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

class TokenManager {
  static _apiKey = process.env.SALUTESPEECH_API_KEY || null;
  static _token = null;
  static _expiresAt = null; // Время истечения в миллисекундах
  static _tokenPromise = null; // Промис для запроса токена, если он уже выполняется

  /**
   * Возвращает API-ключ для SaluteSpeech.
   * Если ключ ещё не установлен, извлекает его из переменной окружения SALUTESPEECH_API_KEY.
   * @returns {string} API-ключ.
   */
  static getApiKey() {
    if (!this._apiKey) {
      this._apiKey = process.env.SALUTESPEECH_API_KEY;
    }
    return this._apiKey;
  }

  /**
   * Возвращает текущий токен доступа.
   * Если токен отсутствует или истёк (с учетом отступа 2000 мс), запрашивает новый.
   * При параллельных вызовах использует кэширование промиса, чтобы избежать повторных HTTP-запросов.
   * @returns {Promise<string>} Текущий токен доступа.
   */
  static async getToken() {
    const now = Date.now();
    if (this._token && this._expiresAt && this._expiresAt >= now - 2000) {
      return this._token;
    }
    if (!this._tokenPromise) {
      this._tokenPromise = this.__requestForNewToken()
        .then(({ token, expiresAt }) => {
          this._token = token;
          this._expiresAt = expiresAt;
          this._tokenPromise = null; // Сбрасываем промис после успешного получения токена
          return token;
        })
        .catch((error) => {
          this._tokenPromise = null; // При ошибке сбрасываем, чтобы последующие вызовы могли повторить запрос
          throw error;
        });
    }
    return this._tokenPromise;
  }

  /**
   * Запрашивает новый токен доступа от API SaluteSpeech.
   * Выполняет POST-запрос с необходимыми заголовками и данными.
   * @returns {Promise<{token: string, expiresAt: number}>} Объект с токеном и временем его истечения.
   * @throws {Error} Если запрос завершился неудачно.
   */
  static async __requestForNewToken() {
    const url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
    const headers = {
      'Authorization': `Basic ${this.getApiKey()}`,
      'RqUID': uuidv4(),
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const data = "scope=SALUTE_SPEECH_PERS";

    return axios.post(url, data, {
      headers,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    .then(response => {
      if (response.status === 200) {
        const responseData = response.data;
        return { token: responseData.access_token, expiresAt: responseData.expires_at };
      } else {
        throw new Error(`Получен статус ${response.status}`);
      }
    })
    .catch(error => {
      throw new Error(`Не удалось получить токен: ${error.message}`);
    });
  }
}

module.exports = TokenManager;
