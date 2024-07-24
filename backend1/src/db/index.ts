import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'your-db-name';

let db: MongoClient;

export const connectDB = async () => {
  db = await MongoClient.connect(url);
  console.log('Connected to database');
};

export const getDB = () => db.db(dbName);
