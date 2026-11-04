// Shared MongoDB connection (cached across warm serverless invocations).
// Set MONGODB_URI (and optionally MONGODB_DB) in the environment. Without it the API
// falls back to in-memory data so the app still runs.
const { MongoClient } = require('mongodb');

async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!global._canteenxMongo) {
    global._canteenxMongo = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }).connect();
  }
  try {
    const client = await global._canteenxMongo;
    return client.db(process.env.MONGODB_DB || 'canteenx');
  } catch (err) {
    global._canteenxMongo = null; // retry on next request
    throw err;
  }
}

module.exports = { getDb };
