const { MongoClient } = require('mongodb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '27017';
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
      { useUnifiedTopology: true });
    this.client.connect((err) => {
      if (err) console.log('Error Connecting to the database', err.message);
      else console.log('Successfully connected to the database');
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    // eslint-disable-next-line no-return-await
    return await this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    // eslint-disable-next-line no-return-await
    return await this.client.db().collection('files').countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
