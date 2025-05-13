const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const app = require('../src/app');
const syncService = require('../src/services/syncService');

chai.use(chaiHttp);

describe('SyncController', function () {
  let serviceStub;

  beforeEach(() => {
    serviceStub = sinon.stub(syncService, 'syncData');
  });

  afterEach(() => {
    serviceStub.restore();
  });

  // После всех тестов останавливаем сервер
  after(() => {
    app.close();
  });

  it('должен возвращать 200 и результат синхронизации при корректном запросе', async function () {
    const mockResult = {
      data: [
        {
          sync_id: 101,
          table_name: 'Scores',
          action: 'insert',
          record_data: { a: 1 },
        }
      ],
      new_sync_id: 101
    };

    serviceStub.resolves(mockResult);

    const res = await chai.request(app)
      .post('/api/sync')
      .send({
        sub: 'user123',
        last_sync_id: 99
      });

    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal(mockResult);
    expect(serviceStub.calledOnceWithExactly('user123', 99)).to.be.true;
  });

  it('должен возвращать 400, если last_sync_id отсутствует', async function () {
    const res = await chai.request(app)
      .post('/api/sync')
      .send({ sub: 'user123' });

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ error: '"last_sync_id" обязателен и должен быть числом.' });
    expect(serviceStub.notCalled).to.be.true;
  });

  it('должен возвращать 400, если sub не строка', async function () {
    const res = await chai.request(app)
      .post('/api/sync')
      .send({ sub: 123, last_sync_id: 5 });

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ error: '"sub" должно быть строкой или null.' });
    expect(serviceStub.notCalled).to.be.true;
  });

  it('должен возвращать 500 при ошибке сервиса', async function () {
    serviceStub.rejects(new Error('Ошибка синхронизации'));

    const res = await chai.request(app)
      .post('/api/sync')
      .send({ sub: 'user123', last_sync_id: 5 });

    expect(res).to.have.status(500);
    expect(res.body).to.deep.equal({ error: 'Ошибка синхронизации' });
    expect(serviceStub.calledOnceWithExactly('user123', 5)).to.be.true;
  });
});
