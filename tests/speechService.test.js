const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const speechService = require('../src/services/speechService');
const TokenManager = require('../src/utils/tokenManager');

describe('SpeechService', function () {
  let axiosStub, tokenStub;

  beforeEach(() => {
    tokenStub = sinon.stub(TokenManager, 'getToken').resolves('mock-token');
    axiosStub = sinon.stub(axios, 'post');
  });

  afterEach(() => {
    tokenStub.restore();
    axiosStub.restore();
  });

  it('должен корректно отправлять запрос в SaluteSpeech API', async function () {
    axiosStub.resolves({
      headers: { 'content-type': 'audio/ogg' },
      data: Buffer.from('fake audio data')
    });

    const response = await speechService.synthesizeSpeech({ text: 'Привет', voice: 'Oksana', format: 'opus' });

    expect(response.headers['content-type']).to.equal('audio/ogg');
    expect(response.data).to.be.an.instanceof(Buffer);
    expect(axiosStub.calledOnce).to.be.true;
  });

  it('должен обрабатывать ошибку при неудачном запросе к API', async function () {
    axiosStub.rejects(new Error('Ошибка API'));

    try {
      await speechService.synthesizeSpeech({ text: 'Привет', voice: 'Oksana', format: 'opus' });
      throw new Error('Ожидалась ошибка, но метод завершился успешно');
    } catch (error) {
      expect(error.message).to.include('Ошибка API');
    }
  });
});
