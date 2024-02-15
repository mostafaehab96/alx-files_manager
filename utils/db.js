const { MongoClient } = require('mongodb');
const sha1 = require('sha1');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '27017';
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
      { useUnifiedTopology: true });
    this.client.connect((err) => {
      if (err) console.log('Error Connecting to the database', err.message);
      else {
        console.log('Successfully connected to the database');
        this.users = this.client.db().collection('users');
        this.files = this.client.db().collection('files');
      }
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    // eslint-disable-next-line no-return-await
    return await this.users.countDocuments();
  }

  async nbFiles() {
    // eslint-disable-next-line no-return-await
    return await this.files.countDocuments();
  }

  async addUser(user) {
    let newUser = await this.users.findOne({ email: user.email });
    if (newUser) return null;
    newUser = { ...user };
    newUser.password = sha1(user.password);
    newUser = await this.users.insertOne(newUser);
    return newUser;
  }

  // eslint-disable-next-line consistent-return
  async addFile(file) {
    const newFile = await this.files.insertOne(file);
    return newFile.insertedId;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
