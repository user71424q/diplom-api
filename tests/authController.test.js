const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const chaiHttp = require('chai-http');
const app = require('../src/app');
const progressService = require('../src/services/progressService');

chai.use(chaiHttp);

describe('AuthController', function () {
  let createUserStub;

  beforeEach(() => {
    createUserStub = sinon.stub(progressService, 'createUser');
  });

  afterEach(() => {
    createUserStub.restore();
  });

  it('должен создавать пользователя при корректном запросе', async function () {
    const payload = {
      sub: 'vk1234567890',
      user_name: 'Иван Иванов'
    };

    createUserStub.resolves();

    const res = await chai.request(app)
      .post('/api/auth/vk')
      .send(payload);

    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal({ message: 'Данные пользователя успешно обновлены.' });
    expect(createUserStub.calledOnceWithExactly(payload)).to.be.true;
  });

  it('должен возвращать 400 при отсутствии sub', async function () {
    const res = await chai.request(app)
      .post('/api/auth/vk')
      .send({ user_name: 'Иван Иванов' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal('Параметр "sub" обязателен и должен быть строкой.');
    expect(createUserStub.notCalled).to.be.true;
  });

  it('должен возвращать 400 при отсутствии user_name', async function () {
    const res = await chai.request(app)
      .post('/api/auth/vk')
      .send({ sub: 'vk1234567890' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.equal('Параметр "user_name" обязателен и должен быть строкой.');
    expect(createUserStub.notCalled).to.be.true;
  });

  it('должен возвращать 500 при ошибке в сервисе', async function () {
    createUserStub.rejects(new Error('Ошибка БД'));

    const res = await chai.request(app)
      .post('/api/auth/vk')
      .send({
        sub: 'vk1234567890',
        user_name: 'Иван Иванов'
      });

    expect(res).to.have.status(500);
    expect(res.body.error).to.equal('Ошибка сервиса');
  });
});
