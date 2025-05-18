const express = require('express');
const path = require('path');
const db = require('./db/database');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Главная страница — загрузка меню и заказов
app.get('/', (req, res) => {
  db.all(`SELECT * FROM menu_items`, (err, menuItems) => {
    if (err) return res.status(500).send(err.message);

    db.all(`SELECT * FROM orders WHERE status = 'Готовится'`, (err2, currentOrders) => {
      if (err2) return res.status(500).send(err2.message);

      db.all(`SELECT * FROM orders WHERE status = 'Забрали'`, (err3, pastOrders) => {
        if (err3) return res.status(500).send(err3.message);

        db.all(`SELECT * FROM reservations`, (err4, reservations) => {
          if (err4) return res.status(500).send(err4.message);

          res.render('index', {
            menuItems,
            currentOrders,
            pastOrders,
            reservations
          });
        });
      });
    });
  });
});

// API: Получить меню
app.get('/api/menu', (req, res) => {
  db.all(`SELECT * FROM menu_items`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Создать заказ
app.post('/api/orders', (req, res) => {
  const items = JSON.stringify(req.body.items || []);
  const status = 'Готовится';

  db.run(`INSERT INTO orders (items, status) VALUES (?, ?)`, [items, status], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// API: Получить заказы с фильтром по статусу (опционально)
app.get('/api/orders', (req, res) => {
  const status = req.query.status;
  let sql = 'SELECT * FROM orders';
  let params = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Получить бронирования
app.get('/api/reservations', (req, res) => {
  db.all('SELECT * FROM reservations', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Создать бронирование
app.post('/api/reservations', (req, res) => {
  const { first_name, last_name, email, people_count, table_number, reservation_time, notes } = req.body;

  const sql = `INSERT INTO reservations 
    (first_name, last_name, email, people_count, table_number, reservation_time, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [first_name, last_name, email, people_count, table_number, reservation_time, notes], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// API: Удалить бронирование по id
app.delete('/api/reservations/:id', (req, res) => {
  const id = req.params.id;
  console.log('Удаление бронирования с id:', id);
  db.run('DELETE FROM reservations WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Бронирование не найдено' });
    res.json({ message: 'Бронирование удалено' });
  });
});
// API: Добавить позицию меню
app.post('/api/menu', (req, res) => {
  const { name, price, description, weight } = req.body;
  const sql = `INSERT INTO menu_items (name, price, description, weight) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, price, description, weight], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});
// Страница добавления позиции в меню
app.get('/add-menu-item', (req, res) => {
  res.render('add-menu-item'); // создашь этот файл в папке views
});
app.delete('/api/menu/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM menu_items WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// Запуск сервера и открытие браузера с динамическим импортом open
(async () => {
  const open = (await import('open')).default;

  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`);
  });
})();
