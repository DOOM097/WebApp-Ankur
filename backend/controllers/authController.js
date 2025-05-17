const db = require('../db');

const loginUser = (req, res) => {
  const { username, password } = req.body;
  
  db.query(
    'SELECT role FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        res.status(500).json({ message: 'Ошибка на сервере' });
      } else if (results.length > 0) {
        res.status(200).json({ role: results[0].role });
      } else {
        res.status(401).json({ message: 'Неверные данные' });
      }
    }
  );
};

module.exports = { loginUser };
