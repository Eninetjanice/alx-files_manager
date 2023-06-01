const Queue = require('bull');
const thumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

fileQueue.process(async (job) => {
  const { fileId = null, userId = null } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const files = dbClient.db.collection('files');
  const file = await files.findOne({ _id: fileId, userId });

  if (!file) {
    throw new Error('File not found');
  }

  const originalFilePath = file.localPath;

  const thumbnailSizes = [500, 250, 100];
  const thumbnailPromises = thumbnailSizes.map(async (size) => {
    const thumbnailPath = `${originalFilePath}_${size}`;
    const thumbnailOptions = { width: size };

    const thumbnailData = await thumbnail(originalFilePath, thumbnailOptions);
    await fs.writeFile(thumbnailPath, thumbnailData);
  });

  await Promise.all(thumbnailPromises);
});

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const users = dbClient.db.collection('users');
  const user = await users.findOne({ _id: userId });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
});

module.exports = userQueue;
module.exports = fileQueue;
