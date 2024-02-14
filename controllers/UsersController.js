const dbClient = require('../utils/db');

const postNew = async (req, res) => {
  const [email, password] = [req.body.email, req.body.password];
  if (!email) return res.status(400).json({ error: 'Missing email' });
  if (!password) return res.status(400).json({ error: 'Missing password' });
  const user = await dbClient.addUser({ email, password });

  if (user) {
    return res.status(201).json({ id: user.insertedId, email });
  } return res.status(400).json({ error: 'Already exists' });
};

module.exports = postNew;
