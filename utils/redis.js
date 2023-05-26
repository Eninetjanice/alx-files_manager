// Redis utils

import { promisify } from 'util';
import redis from 'redis';

// Constructor that creates a client to Redis
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.isClientConnected = true;

    // Error handling
    this.client.on('error', (error) => {
      console.error('Redis client failure:', error.message || error.toString());
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  /**
   * Function that returns true when connection to Redis
   * is a success otherwise, false
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * async function get
   * @param {String} key
   * @returns  Redis value stored for this key
   */
  async get(key) {
    const getAsync = promisify(this.client.GET).bind(this.client);
    return getAsync(key);
  }

  /**
   * async function set
   * @param {String} key
   * @param {String | Number | Boolean} value
   * @param {Number} duration The expiration time of the item in seconds.
   * @returns {String | Object}
   */
  async set(key, value, duration) {
    const setexAsync = promisify(this.client.SETEX).bind(this.client);
    return setexAsync(key, duration, value);
  }

  /**
   * async func del
   * @param {String} key
   * removes the value in Redis for this key
   */
  async del(key) {
    await
    promisify(this.client.DEL).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
