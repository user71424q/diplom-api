const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const app = require('../src/app');
const progressService = require('../src/services/progressService');

chai.use(chaiHttp);

describe('ProgressController', function () {
  let serviceStub;

  beforeEach(() => {
    serviceStub = sinon.stub(progressService, 'submitStats');
  });

  afterEach(() => {
    serviceStub.restore();
  });

  it('должен возвращать 200 при корректном обновлении прогресса', async function () {
    serviceStub.resolves();

    const res = await chai.request(app)
      .post('/api/sync/stats')
      .send({
        sub: 'validSub',
        data: { poem_id: 1, score_time: '2024-02-17 14:30:00', score_grade: 5, difficulty: 'med', level: 'level2' }
      });

    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal({ message: 'Данные о прогрессе успешно обновлены.' });
  });

  it('должен возвращать 400 при отсутствии sub', async function () {
    const res = await chai.request(app)
      .post('/api/sync/stats')
      .send({
        data: { poem_id: 1, score_time: '2024-02-17 14:30:00', score_grade: 5, difficulty: 'med', level: 'level2' }
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal('Параметр "sub" обязателен и должен быть строкой.');
  });

  it('должен возвращать 500 при ошибке сервиса', async function () {
    serviceStub.rejects(new Error('Ошибка сервиса'));

    const res = await chai.request(app)
      .post('/api/sync/stats')
      .send({
        sub: 'validSub',
        data: { poem_id: 1, score_time: '2024-02-17 14:30:00', score_grade: 5, difficulty: 'med', level: 'level2' }
      });

    expect(res).to.have.status(500);
    expect(res.body.error).to.equal('Ошибка сервиса');
  });
});
