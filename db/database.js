const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'restaurant.db'), err => {
  if (err) return console.error('Ошибка открытия базы:', err.message);

  // Создаем таблицу menu_items, если не существует
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    weight INTEGER
    )
  `);

  // Создаем таблицу orders, если не существует
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      items TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  // Создаем таблицу reservations, если не существует, с колонкой notes
  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      people_count INTEGER NOT NULL,
      table_number INTEGER NOT NULL,
      reservation_time TEXT NOT NULL,
      notes TEXT
    )
  `);
});

module.exports = db;
