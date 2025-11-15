const { MongoClient } = require('mongodb');

let client;

async function connectMongoDB() {
  if (client) return client;

  try {
    client = new MongoClient(process.env.MONGODB_URL, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    await client.connect();
    await client.db().admin().ping();
    console.log('✅ MongoDB connected successfully');
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

function getMongoClient() {
  if (!client) {
    throw new Error('MongoDB not initialized. Call connectMongoDB first.');
  }
  return client;
}

function getDB() {
  return getMongoClient().db();
}

module.exports = { connectMongoDB, getMongoClient, getDB };
