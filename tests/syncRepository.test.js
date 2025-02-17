const { expect } = require('chai');
const sinon = require('sinon');
const SyncRepository = require('../src/models/syncRepository');

describe('SyncRepository', function() {
  let fakeDb, repository;
  
  beforeEach(() => {
    // Создаем имитацию объекта базы с методом query
    fakeDb = { query: sinon.stub() };
    repository = new SyncRepository(fakeDb);
  });
  
  afterEach(() => {
    sinon.restore();
  });

  it('getSyncData должен возвращать полный результат вызова процедуры sp_sync_data', async function() {
    const fakeResult = [
      [
        { sync_id: 101, table_name: 'authors', record_id: '1', action: 'insert', record_data: '{"a":1}', change_owner: null, created_at: '2023-01-01 00:00:00' },
        { sync_id: 102, table_name: 'authors', record_id: '2', action: 'update', record_data: '{"a":2}', change_owner: 5, created_at: '2023-01-01 00:01:00' }
      ]
    ];
    fakeDb.query.withArgs('CALL sp_sync_data(?, ?)', ['someSub', 50]).resolves(fakeResult);
    
    const result = await repository.getSyncData('someSub', 50);
    expect(result).to.deep.equal(fakeResult[0]);
  });

  it('getNewSyncId должен возвращать sync_id из SyncLog', async function() {
    const fakeResult = [{ sync_id: 150 }];
    fakeDb.query.withArgs('SELECT MAX(sync_id) AS sync_id FROM SyncLog').resolves(fakeResult);
    
    const syncId = await repository.getNewSyncId();
    expect(syncId).to.equal(150);
  });

  it('getUserIdBySub должен возвращать user_id, если пользователь найден', async function() {
      const fakeResult = [{ user_id: 10 }];
      fakeDb.query.withArgs(
          'SELECT COALESCE((SELECT user_id FROM Users WHERE sub = ? LIMIT 1), NULL) AS user_id',
          ['testSub']
      ).resolves(fakeResult);
      
      const userId = await repository.getUserIdBySub('testSub');
      expect(userId).to.equal(10);
  });

  it('getUserIdBySub должен возвращать null, если пользователь не найден', async function() {
      const fakeResult = [{ user_id: null }];
      fakeDb.query.withArgs(
          'SELECT COALESCE((SELECT user_id FROM Users WHERE sub = ? LIMIT 1), NULL) AS user_id',
          ['unknownSub']
      ).resolves(fakeResult);
      
      const userId = await repository.getUserIdBySub('unknownSub');
      expect(userId).to.be.null;
  });


  it('insertScore должен выполнять корректный SQL-запрос', async function() {
    const userId = 10;
    const scoreData = {
      poem_id: 5,
      score_time: '2024-02-17 14:30:00',
      score_grade: 4,
      difficulty: 'med',
      level: 'level2'
    };
    
    fakeDb.query.resolves();
    
    await repository.insertScore(userId, scoreData);
    
    expect(fakeDb.query.calledOnceWithExactly(
      'INSERT INTO Scores (poem_id, user_id, score_time, score_grade, difficulty, level) VALUES (?, ?, ?, ?, ?, ?)',
      [5, 10, '2024-02-17 14:30:00', 4, 'med', 'level2']
    )).to.be.true;
  });

  it('insertFavorite должен выполнять корректный SQL-запрос', async function() {
    const userId = 10;
    const poemId = 3;
    
    fakeDb.query.resolves();
    
    await repository.insertFavorite(userId, poemId);
    
    expect(fakeDb.query.calledOnceWithExactly(
      'INSERT INTO Favorites (user_id, poem_id) VALUES (?, ?)',
      [10, 3]
    )).to.be.true;
  });

  it('updateUserData должен выполнять корректный SQL-запрос', async function() {
    const userId = 10;
    const userData = { user_name: 'New Name' };
    
    fakeDb.query.resolves();
    
    await repository.updateUserData(userId, userData);
    
    expect(fakeDb.query.calledOnceWithExactly(
      'UPDATE Users SET ? WHERE user_id = ?',
      [userData, 10]
    )).to.be.true;
  });
});
