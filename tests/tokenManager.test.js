const { expect } = require('chai');
const sinon = require('sinon');
const TokenManager = require('../src/utils/tokenManager'); // убедитесь, что путь корректен

describe('TokenManager', function() {
  // Перед каждым тестом сбрасываем состояние статических свойств
  beforeEach(function() {
    TokenManager._token = null;
    TokenManager._expiresAt = null;
    // Принудительно задаем API-ключ, чтобы не зависеть от окружения
    TokenManager._apiKey = "test-api-key";
  });

  describe('getApiKey', function() {
    it('должен возвращать API-ключ из переменной окружения, если он не установлен', function() {
      process.env.SALUTESPEECH_API_KEY = "env-api-key";
      TokenManager._apiKey = null; // сброс
      const apiKey = TokenManager.getApiKey();
      expect(apiKey).to.equal("env-api-key");
    });
  });

  describe('getToken', function() {
    it('должен запрашивать новый токен, если его нет', async function() {
      const stub = sinon.stub(TokenManager, '__requestForNewToken').resolves({
        token: 'new-token',
        expiresAt: Date.now() + 3600000
      });
      const token = await TokenManager.getToken();
      expect(token).to.equal('new-token');
      expect(stub.calledOnce).to.be.true;
      stub.restore();
    });

    it('должен возвращать закэшированный токен, если он не истёк', async function() {
      TokenManager._token = 'cached-token';
      TokenManager._expiresAt = Date.now() + 3600000;
      const stub = sinon.stub(TokenManager, '__requestForNewToken');
      const token = await TokenManager.getToken();
      expect(token).to.equal('cached-token');
      expect(stub.notCalled).to.be.true;
      stub.restore();
    });

    it('должен запрашивать новый токен, если предыдущий истёк', async function() {
      TokenManager._token = 'old-token';
      TokenManager._expiresAt = Date.now() - 5000; // токен просрочен
      const stub = sinon.stub(TokenManager, '__requestForNewToken').resolves({
        token: 'refreshed-token',
        expiresAt: Date.now() + 3600000
      });
      const token = await TokenManager.getToken();
      expect(token).to.equal('refreshed-token');
      expect(stub.calledOnce).to.be.true;
      stub.restore();
    });

    it('должен генерировать ошибку, если __requestForNewToken выбрасывает исключение', async function() {
      const stub = sinon.stub(TokenManager, '__requestForNewToken').rejects(new Error("Token error"));
      try {
        await TokenManager.getToken();
        throw new Error("Ожидалась ошибка, но вызов завершился успешно");
      } catch (error) {
        expect(error.message).to.equal("Token error");
      }
      stub.restore();
    });

    it('должен возвращать один и тот же токен при параллельных вызовах, если он не истёк', async function() {
      // Убедимся, что при одновременных вызовах __requestForNewToken вызывается только один раз
      TokenManager._token = null;
      TokenManager._expiresAt = null;
      const stub = sinon.stub(TokenManager, '__requestForNewToken').resolves({
        token: 'concurrent-token',
        expiresAt: Date.now() + 3600000
      });
      const [token1, token2] = await Promise.all([TokenManager.getToken(), TokenManager.getToken()]);
      expect(token1).to.equal('concurrent-token');
      expect(token2).to.equal('concurrent-token');
      expect(stub.calledOnce).to.be.true;
      stub.restore();
    });
  });
});
