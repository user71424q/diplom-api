const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const app = require('../src/app');
const progressService = require('../src/services/progressService');

chai.use(chaiHttp);

describe('submitStats', function () {
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


describe('submitFavorites', function () {
  let favStub;

  beforeEach(() => {
    favStub = sinon.stub(progressService, 'submitFavorites');
  });

  afterEach(() => {
    favStub.restore();
  });

  it('должен возвращать 200 при корректном добавлении в избранное', async function () {
    favStub.resolves();

    const res = await chai.request(app)
      .post('/api/sync/favorites')
      .send({
        sub: 'validSub',
        data: { poem_id: 7 }
      });

    expect(res).to.have.status(200);
    expect(res.body.message).to.equal('Избранное успешно обновлено.');
    expect(favStub.calledOnceWithExactly('validSub', { poem_id: 7 }, undefined)).to.be.true;
  });

  it('должен возвращать 200 при корректном удалении из избранного', async function () {
    favStub.resolves();

    const res = await chai.request(app)
      .post('/api/sync/favorites')
      .send({
        sub: 'validSub',
        data: { poem_id: 7 },
        delete_flag: true
      });

    expect(res).to.have.status(200);
    expect(res.body.message).to.equal('Избранное успешно обновлено.');
    expect(favStub.calledOnceWithExactly('validSub', { poem_id: 7 }, true)).to.be.true;
  });

  it('должен возвращать 400 при невалидном delete_flag', async function () {
    const res = await chai.request(app)
      .post('/api/sync/favorites')
      .send({
        sub: 'validSub',
        data: { poem_id: 7 },
        delete_flag: "not-a-boolean"
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal('Параметр "delete_flag" должен быть булевым значением.');
  });

  it('должен возвращать 400 при отсутствии sub', async function () {
    const res = await chai.request(app)
      .post('/api/sync/favorites')
      .send({ data: { poem_id: 7 } });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal('Параметр "sub" обязателен и должен быть строкой.');
  });

  it('должен возвращать 500 при ошибке сервиса', async function () {
    favStub.rejects(new Error('Ошибка сервиса'));

    const res = await chai.request(app)
      .post('/api/sync/favorites')
      .send({ sub: 'validSub', data: { poem_id: 7 } });

    expect(res).to.have.status(500);
    expect(res.body.error).to.equal('Ошибка сервиса');
  });
});

describe('updateUserData', function () {
  let updateStub;

  beforeEach(() => {
    updateStub = sinon.stub(progressService, 'updateUserData');
  });

  afterEach(() => {
    updateStub.restore();
  });

  it('должен возвращать 200 при корректном обновлении данных пользователя', async function () {
    updateStub.resolves();

    const res = await chai.request(app)
      .post('/api/sync/users')
      .send({
        sub: 'validSub',
        data: { user_name: 'New Name' }
      });

    expect(res).to.have.status(200);
    expect(res.body.message).to.equal('Данные пользователя успешно обновлены.');
    expect(updateStub.calledOnceWithExactly('validSub', { user_name: 'New Name' })).to.be.true;
  });

  it('должен возвращать 400 при отсутствии sub', async function () {
    const res = await chai.request(app)
      .post('/api/sync/users')
      .send({
        data: { user_name: 'Name' }
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal('Параметр "sub" обязателен и должен быть строкой.');
  });

  it('должен возвращать 400 при отсутствии data', async function () {
    const res = await chai.request(app)
      .post('/api/sync/users')
      .send({
        sub: 'validSub'
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal('Параметр "data" обязателен и должен быть объектом.');
  });

  it('должен возвращать 500 при ошибке сервиса', async function () {
    updateStub.rejects(new Error('Ошибка сервиса'));

    const res = await chai.request(app)
      .post('/api/sync/users')
      .send({
        sub: 'validSub',
        data: { user_name: 'Name' }
      });

    expect(res).to.have.status(500);
    expect(res.body.error).to.equal('Ошибка сервиса');
  });
});

