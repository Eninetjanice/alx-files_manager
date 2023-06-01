/**
 * Tests for the following endpoints:
 * GET /status
 * GET /stats
 * POST /users
 * GET /connect
 * GET /disconnect
 * GET /users/me
 * POST /files
 * GET /files/:id
 * GET /files (with the pagination)
 * PUT /files/:id/publish
 * PUT /files/:id/unpublish
 * GET /files/:id/data
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { promisify } = require('util');
const redis = require('redis');
const { MongoClient, ObjectID } = require('mongodb');
const sha1 = require('sha1');

chai.use(chaiHttp);

describe('gET /files/:id/data', () => {
  let testClientDb;
  let testRedisClient;
  let redisDelAsync;
  let redisSetAsync;
  let redisKeysAsync;

  let fileUser = null;
  let fileUserId = null;

  let initialUser = null;
  let initialUserId = null;
  let initialUserToken = null;

  let initialUnpublishedFileId = null;
  let initialPublishedFileId = null;

  const folderTmpFilesManagerPath = process.env.FOLDER_PATH || '/tmp/files_manager';

  const fctRandomString = () => Math.random().toString(36).substring(2, 15);
  const fctRemoveAllRedisKeys = async () => {
    const keys = await redisKeysAsync('auth_*');
    await Promise.all(keys.map((key) => redisDelAsync(key)));
  };
  const fctCreateTmp = () => {
    if (!fs.existsSync(folderTmpFilesManagerPath)) {
      fs.mkdirSync(folderTmpFilesManagerPath);
    }
  };
  const fctRemoveTmp = async () => {
    if (fs.existsSync(folderTmpFilesManagerPath)) {
      const files = await fs.promises.readdir(folderTmpFilesManagerPath);
      await Promise.all(files.map((file) => fs.promises.unlink(`${folderTmpFilesManagerPath}/${file}`)));
    }
  };

  before(async () => {
    const dbInfo = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '27017',
      database: process.env.DB_DATABASE || 'files_manager',
    };
    fctRemoveTmp();
    testClientDb = await MongoClient.connect(`mongodb://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}`);
    await testClientDb.collection('users').deleteMany({});
    await testClientDb.collection('files').deleteMany({});

    // Add 1 user
    initialUser = {
      email: `${fctRandomString()}@me.com`,
      password: sha1(fctRandomString()),
    };
    const createdUserDocs = await testClientDb.collection('users').insertOne(initialUser);
    if (createdUserDocs && createdUserDocs.ops.length > 0) {
      initialUserId = createdUserDocs.ops[0]._id.toString();
    }

    // Add 1 user owner of file
    fileUser = {
      email: `${fctRandomString()}@me.com`,
      password: sha1(fctRandomString()),
    };
    const createdUserFileDocs = await testClientDb.collection('users').insertOne(fileUser);
    if (createdUserFileDocs && createdUserFileDocs.ops.length > 0) {
      fileUserId = createdUserFileDocs.ops[0]._id.toString();
    }

    // Add 1 file publish
    fctCreateTmp();
    const initialFileP = {
      userId: ObjectID(fileUserId),
      name: fctRandomString(),
      type: 'file',
      parentId: '0',
      isPublic: true,
      localPath: `${folderTmpFilesManagerPath}/${uuidv4()}`,
    };
    const createdFilePDocs = await testClientDb.collection('files').insertOne(initialFileP);
    if (createdFilePDocs && createdFilePDocs.ops.length > 0) {
      initialPublishedFileId = createdFilePDocs.ops[0]._id.toString();
    }

    // Add 1 file unpublish
    const initialFileUP = {
      userId: ObjectID(fileUserId),
      name: fctRandomString(),
      type: 'file',
      parentId: '0',
      isPublic: false,
      localPath: `${folderTmpFilesManagerPath}/${uuidv4()}`,
    };
    const createdFileUPDocs = await testClientDb.collection('files').insertOne(initialFileUP);
    if (createdFileUPDocs && createdFileUPDocs.ops.length > 0) {
      initialUnpublishedFileId = createdFileUPDocs.ops[0]._id.toString();
    }

    testRedisClient = redis.createClient();
    redisDelAsync = promisify(testRedisClient.del).bind(testRedisClient);
    redisSetAsync = promisify(testRedisClient.set).bind(testRedisClient);
    redisKeysAsync = promisify(testRedisClient.keys).bind(testRedisClient);

    await fctRemoveAllRedisKeys();

    // Set token for this user
    initialUserToken = uuidv4();
    await redisSetAsync(`auth_${initialUserToken}`, initialUserId);
  });

  after(async () => {
    fctRemoveTmp();
    testClientDb.close();
  });

  afterEach(async () => {
    await fctRemoveTmp();
  });

  it('gET /files/:id/data with an unpublished file not present locally linked to :id and user unauthenticated', () => new Promise((done) => {
    chai.request('http://localhost:5000')
      .get(`/files/${initialUnpublishedFileId}/data`)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(404);
        const resError = res.body.error;
        chai.expect(resError).to.equal('Not found');
        done();
      });
  })).timeout(30000);

  it('gET /files/:id/data with a published file not present locally linked to :id and user unauthenticated', () => new Promise((done) => {
    chai.request('http://localhost:5000')
      .get(`/files/${initialPublishedFileId}/data`)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(404);
        const resError = res.body.error;
        chai.expect(resError).to.equal('Not found');
        done();
      });
  })).timeout(30000);
});
