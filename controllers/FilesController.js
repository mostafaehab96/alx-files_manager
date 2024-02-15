const fs = require('fs');
const { ObjectId } = require('mongodb');
const uuid = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const postUpload = async (req, res) => {
  const tokenHeader = req.headers['x-token'];
  const key = `auth_${tokenHeader}`;
  const userId = await redisClient.get(key);
  const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
  if (user) {
    const {
      name, type, parentId, isPublic, data,
    } = { ...req.body };
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });
    if (parentId) {
      const file = await dbClient.files.findOne({ _id: ObjectId(parentId) });
      if (!file) return res.status(400).json({ error: 'Parent not found' });
      if (file.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }
    const newFile = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };
    if (type !== 'folder') {
      let path = process.env.FOLDER_PATH || '/tmp/files_manager/';
      const filename = uuid.v4();
      const realData = Buffer.from(data, 'base64').toString();
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      path += filename;
      fs.writeFile(path, realData, { flag: 'w+', encoding: 'utf-8' }, (err) => {
        if (err) console.log('Error writing data', err.message);
      });
      newFile.localPath = path;
    }

    const id = await dbClient.addFile({ ...newFile });
    return res.status(201).json({ id, ...newFile });
  }

  return res.status(401).json({ error: 'Unauthorized' });
};

module.exports = postUpload;
