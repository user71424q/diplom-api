const { expect } = require('chai');
require('dotenv').config();

const TokenManager = require('../src/utils/tokenManager');

describe('Интеграционный тест для __requestForNewToken', function() {

  it('должен возвращать объект с токеном и expiresAt', async function() {
    if (!process.env.SALUTESPEECH_API_KEY) {
      this.skip(); // Пропускаем тест, если API-ключ не задан
    }
    
    try {
      // Вызываем метод напрямую
      const result = await TokenManager.__requestForNewToken();
      // Проверяем, что возвращается объект с ключами 'token' и 'expiresAt'
      expect(result).to.have.property('token').that.is.a('string');
      expect(result).to.have.property('expiresAt').that.is.a('number');
    } catch (error) {
      throw new Error(`Интеграционный запрос не удался: ${error.message}`);
    }
  });
});
