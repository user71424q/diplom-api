const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const progressService = require('../src/services/progressService');
const progressRepository = require('../src/models/syncRepository');

describe('ProgressService', function () {
  let repoStub;

  beforeEach(() => {
    repoStub = sinon.stub(progressRepository.prototype, 'insertScore');
  });

  afterEach(() => {
    repoStub.restore();
  });

  it('должен успешно обновлять прогресс пользователя', async function () {
    const getUserIdStub = sinon.stub(progressRepository.prototype, 'getUserIdBySub').resolves(123);
    repoStub.resolves();

    await progressService.submitStats('validSub', {
      poem_id: 1,
      score_time: '2024-02-17 14:30:00',
      score_grade: 5,
      difficulty: 'med',
      level: 'level2'
    });

    expect(getUserIdStub.calledOnceWithExactly('validSub')).to.be.true;
    expect(repoStub.calledOnceWithExactly(123, {
      poem_id: 1,
      score_time: '2024-02-17 14:30:00',
      score_grade: 5,
      difficulty: 'med',
      level: 'level2'
    })).to.be.true;

    getUserIdStub.restore();
  });

  it('должен выбрасывать ошибку, если пользователь не найден', async function () {
    const getUserIdStub = sinon.stub(progressRepository.prototype, 'getUserIdBySub').resolves(null);

    try {
      await progressService.submitStats('invalidSub', { poem_id: 1, score_time: '2024-02-17 14:30:00' });
      throw new Error('Ожидалась ошибка, но вызов завершился успешно');
    } catch (error) {
      expect(error.message).to.include('Пользователь с sub=invalidSub не найден.');
    }

    getUserIdStub.restore();
  });

  it('должен выбрасывать ошибку при сбое БД', async function () {
    const getUserIdStub = sinon.stub(progressRepository.prototype, 'getUserIdBySub').resolves(123);
    repoStub.rejects(new Error('Ошибка БД'));

    try {
      await progressService.submitStats('validSub', { poem_id: 1, score_time: '2024-02-17 14:30:00' });
      throw new Error('Ожидалась ошибка, но вызов завершился успешно');
    } catch (error) {
      expect(error.message).to.equal('Ошибка обновления прогресса: Ошибка БД');
    }

    getUserIdStub.restore();
  });
});
