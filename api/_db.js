import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable. Set it in your Vercel project settings.');
}

// Reuse the client (and its connection pool) across invocations of the same
// warm serverless function container. This is what keeps things fast on
// Vercel — there is no long-running server to keep alive, just a cached
// connection that gets picked back up on the next request.
let cachedClientPromise = globalThis._mongoClientPromise;

if (!cachedClientPromise) {
  const client = new MongoClient(uri);
  cachedClientPromise = client.connect();
  globalThis._mongoClientPromise = cachedClientPromise;
}

export default cachedClientPromise;

export async function getCollection() {
  const client = await cachedClientPromise;
  const dbName = process.env.MONGODB_DB || 'scope-planner';
  return client.db(dbName).collection('todos');
}
