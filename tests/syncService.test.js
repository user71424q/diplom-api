const { expect } = require('chai');
const sinon = require('sinon');
const syncService = require('../src/services/syncService');
const SyncRepository = require('../src/models/syncRepository');

describe('SyncService', function() {
  let getSyncDataStub, getNewSyncIdStub;
  
  beforeEach(() => {
    // Подменяем методы репозитория через его прототип, так как syncService использует внутренний экземпляр
    getSyncDataStub = sinon.stub(SyncRepository.prototype, 'getSyncData').resolves([
      { sync_id: 101, data: 'row1' },
      { sync_id: 102, data: 'row2' }
    ]);
    getNewSyncIdStub = sinon.stub(SyncRepository.prototype, 'getNewSyncId').resolves(102);
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  it('должен возвращать данные синхронизации и новый sync_id для авторизованного пользователя', async function() {
    const result = await syncService.syncData('userSub123', 100);
    expect(result).to.deep.equal({
      data: [
        { sync_id: 101, data: 'row1' },
        { sync_id: 102, data: 'row2' }
      ],
      new_sync_id: 102
    });
    expect(getSyncDataStub.calledOnceWithExactly('userSub123', 100)).to.be.true;
    expect(getNewSyncIdStub.calledOnce).to.be.true;
  });

  it('должен возвращать данные синхронизации и новый sync_id для неавторизованного пользователя', async function() {
    const result = await syncService.syncData(null, 100);
    expect(result).to.deep.equal({
      data: [
        { sync_id: 101, data: 'row1' },
        { sync_id: 102, data: 'row2' }
      ],
      new_sync_id: 102
    });
    expect(getSyncDataStub.calledOnceWithExactly(null, 100)).to.be.true;
    expect(getNewSyncIdStub.calledOnce).to.be.true;
  });
});
