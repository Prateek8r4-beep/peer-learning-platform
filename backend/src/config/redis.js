const redis = require('redis');

let client;

async function connectRedis() {
  if (client) return client;

  try {
    client = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Redis reconnection failed');
          }
          return retries * 100;
        }
      }
    });

    client.on('error', (err) => console.error('Redis Client Error:', err));
    client.on('connect', () => console.log('✅ Redis connected successfully'));

    await client.connect();
    return client;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
}

function getRedisClient() {
  if (!client) {
    throw new Error('Redis not initialized. Call connectRedis first.');
  }
  return client;
}

module.exports = { connectRedis, getRedisClient };
