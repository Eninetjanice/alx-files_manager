import redisClient from './utils/redis';

(async () => {
  // Wait for the Redis client to connect
  await new Promise((resolve) => {
    redisClient.client.on('connect', resolve);
  });

  console.log(redisClient.isAlive());
  console.log(await redisClient.get('myKey'));
  await redisClient.set('myKey', 12, 5);
  console.log(await redisClient.get('myKey'));

  setTimeout(async () => {
    console.log(await redisClient.get('myKey'));
  }, 1000 * 10);
})();
