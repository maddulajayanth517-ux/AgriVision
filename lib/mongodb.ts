import { MongoClient, type Db } from "mongodb"

function getMongoUri() {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Add MONGODB_URI to .env.local and restart the dev server."
    )
  }
  return uri
}

let cached: { client: MongoClient; db: Db } | undefined

export async function connectToDatabase() {
  if (cached) {
    return cached
  }

  const uri = getMongoUri()
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()

  cached = { client, db }
  return cached
}
