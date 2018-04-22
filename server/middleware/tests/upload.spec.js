jest.mock('../../util/s3', () => ({
  deleteObject: jest.fn()
    .mockReturnValue({ promise: jest.fn() }),
  putObject: jest.fn()
    .mockReturnValue({ promise: jest.fn() }),
}));

jest.mock('fs', () => ({
  createReadStream: jest.fn().mockReturnValue('stream'),
}));

process.env.BUCKET_NAME = 'testBucket';

const s3 = require('../../util/s3');
const { remove, upload } = require('../upload');

describe('remove middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call deleteObject', async () => {
    const ctx = { params: { key: 'a.txt', username: 'me' } };
    await remove(ctx, null);
    expect(s3.deleteObject).toHaveBeenCalledWith({
      Bucket: 'testBucket',
      Key: 'me/a.txt',
    });
  });

  it('should set status to 204 on success', async () => {
    const ctx = { params: { key: 'a.txt', username: 'me' } };
    await remove(ctx, null);
    expect(ctx.status).toBe(204);
  });
});

describe('upload middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call putObject', async () => {
    const ctx = {
      params: {
        key: 'a.txt',
        username: 'me',
      },
      request: {
        files: {
          upload: { path: '/fakepath' },
        },
      },
    };
    await upload(ctx, null);
    expect(s3.putObject).toHaveBeenCalledWith({
      Bucket: 'testBucket',
      Key: 'me/a.txt',
      Body: 'stream',
    });
  });

  it('should set status to 204 on success', async () => {
    const ctx = {
      params: {
        key: 'a.txt',
        username: 'me',
      },
      request: {
        files: {
          upload: { path: '/fakepath' },
        },
      },
    };
    await upload(ctx, null);
    expect(ctx.status).toBe(204);
  });

  it('should not call putObject if there is no blob', async () => {
    const ctx = {
      params: {
        key: 'a.txt',
        username: 'me',
      },
      request: {
        files: {},
      },
    };
    await upload(ctx, null);
    expect(s3.putObject).not.toHaveBeenCalled();
  });
});
