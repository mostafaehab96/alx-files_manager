const sha1 = require('sha1');
const uuid = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const getConnect = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    try {
      const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const email = credentials[0];
      let password = credentials[1];
      password = sha1(password);
      const user = await dbClient.users.findOne({ email, password });
      if (user) {
        const token = uuid.v4();
        const key = `auth_${token}`;
        await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
        return res.json({ token });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized' });
};

module.exports = { getConnect };
