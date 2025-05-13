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

  it('submitFavorites: должен добавить в избранное, если delete_ = false', async function () {
    const getUserIdStub = sinon.stub(progressRepository.prototype, 'getUserIdBySub').resolves(10);
    const insertFavoriteStub = sinon.stub(progressRepository.prototype, 'insertFavorite').resolves();
  
    await progressService.submitFavorites('validSub', { poem_id: 42 }, false);
  
    expect(getUserIdStub.calledOnceWithExactly('validSub')).to.be.true;
    expect(insertFavoriteStub.calledOnceWithExactly(10, 42)).to.be.true;
  
    getUserIdStub.restore();
    insertFavoriteStub.restore();
  });
  
  it('submitFavorites: должен удалить из избранного, если delete_ = true', async function () {
    const getUserIdStub = sinon.stub(progressRepository.prototype, 'getUserIdBySub').resolves(10);
    const deleteFavoriteStub = sinon.stub(progressRepository.prototype, 'deleteFavorite').resolves();
  
    await progressService.submitFavorites('validSub', { poem_id: 42 }, true);
  
    expect(getUserIdStub.calledOnceWithExactly('validSub')).to.be.true;
    expect(deleteFavoriteStub.calledOnceWithExactly(10, 42)).to.be.true;
  
    getUserIdStub.restore();
    deleteFavoriteStub.restore();
  });
  
  it('submitFavorites: должен выбрасывать ошибку, если пользователь не найден', async function () {
    const getUserIdStub = sinon.stub(progressRepository.prototype, 'getUserIdBySub').resolves(null);
  
    try {
      await progressService.submitFavorites('unknownSub', { poem_id: 42 }, false);
      throw new Error('Ожидалась ошибка, но вызов завершился успешно');
    } catch (err) {
      expect(err.message).to.include('Пользователь с sub=unknownSub не найден.');
    }
  
    getUserIdStub.restore();
  });
  
  it('updateUserData: должен обновлять данные пользователя', async function () {
    const getUserIdStub = sinon.stub(progressRepository.prototype, 'getUserIdBySub').resolves(7);
    const updateUserStub = sinon.stub(progressRepository.prototype, 'updateUserData').resolves();
  
    await progressService.updateUserData('validSub', { user_name: 'NewName' });
  
    expect(getUserIdStub.calledOnceWithExactly('validSub')).to.be.true;
    expect(updateUserStub.calledOnceWithExactly(7, { user_name: 'NewName' })).to.be.true;
  
    getUserIdStub.restore();
    updateUserStub.restore();
  });
  
  it('updateUserData: должен выбрасывать ошибку, если пользователь не найден', async function () {
    const getUserIdStub = sinon.stub(progressRepository.prototype, 'getUserIdBySub').resolves(null);
  
    try {
      await progressService.updateUserData('unknownSub', { user_name: 'NoOne' });
      throw new Error('Ожидалась ошибка, но вызов завершился успешно');
    } catch (err) {
      expect(err.message).to.include('Пользователь с sub=unknownSub не найден.');
    }
  
    getUserIdStub.restore();
  });
});
