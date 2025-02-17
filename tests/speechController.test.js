const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const server = require('../src/app'); // Импортируем сервер (экземпляр, который можно закрыть)
const speechService = require('../src/services/speechService');

chai.use(chaiHttp);

describe('SpeechController', function () {
  let speechServiceStub;

  beforeEach(() => {
    speechServiceStub = sinon.stub(speechService, 'synthesizeSpeech');
  });

  afterEach(() => {
    speechServiceStub.restore();
  });

  // После всех тестов останавливаем сервер
  after(() => {
    server.close();
  });

  it('должен возвращать 200 и аудиоданные при корректном запросе', async function () {
    speechServiceStub.resolves({
      headers: { 'content-type': 'audio/ogg' },
      data: Buffer.from('fake audio data')
    });

    const res = await chai.request(server)
      .post('/api/speech')
      .send({ text: 'Привет, мир', voice: 'Oksana', format: 'opus' });

    expect(res).to.have.status(200);
    expect(res.header['content-type']).to.equal('audio/ogg');
    // Так как res.body может быть преобразовано в объект, если это буфер, проверим как строку
    // Если сервер возвращает бинарные данные, лучше сравнить длину, например:
    expect(Buffer.isBuffer(res.body)).to.be.true;
  });

  it('должен возвращать 400, если отсутствует текст', async function () {
    const res = await chai.request(server)
      .post('/api/speech')
      .send({ voice: 'Oksana' });

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ error: 'Поле "text" обязательно и должно быть строкой.' });
  });

  it('должен возвращать 400, если формат невалиден', async function () {
    const res = await chai.request(server)
      .post('/api/speech')
      .send({ text: 'Тест', voice: 'Oksana', format: 'mp3' });

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ error: 'Поле "format" должно быть либо "opus", либо "wav16".' });
  });

  it('должен возвращать 503, если сервис недоступен', async function () {
    speechServiceStub.rejects(new Error('Ошибка при синтезе речи'));

    const res = await chai.request(server)
      .post('/api/speech')
      .send({ text: 'Тест', voice: 'Oksana', format: 'opus' });

    expect(res).to.have.status(503);
    expect(res.body).to.deep.equal({ error: 'Внешний сервис временно недоступен. Попробуйте позже.' });
  });
});
