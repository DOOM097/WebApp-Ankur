const express = require('express');
const path = require('path');
const db = require('./db/database');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Главная страница
app.get('/', (req, res) => {
  db.all(`SELECT * FROM menu_items`, (e1, menuItems) => {
    if (e1) return res.status(500).send(e1.message);
    db.all(`SELECT * FROM orders WHERE status = 'Готовится'`, (e2, currentOrders) => {
      if (e2) return res.status(500).send(e2.message);
      db.all(`SELECT * FROM orders WHERE status = 'Забрали'`, (e3, pastOrders) => {
        if (e3) return res.status(500).send(e3.message);
        db.all(`SELECT * FROM reservations`, (e4, reservations) => {
          if (e4) return res.status(500).send(e4.message);
          res.render('index', { menuItems, currentOrders, pastOrders, reservations });
        });
      });
    });
  });
});

// API: меню
app.get('/api/menu', (req, res) => {
  db.all(`SELECT * FROM menu_items`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/menu', (req, res) => {
  const { name, price, description, weight } = req.body;
  db.run(
    `INSERT INTO menu_items (name, price, description, weight) VALUES (?, ?, ?, ?)`,
    [name, price, description, weight],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});
app.delete('/api/menu/:id', (req, res) => {
  db.run(`DELETE FROM menu_items WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// API: заказы
app.get('/api/orders', (req, res) => {
  const status = req.query.status;
  let sql = 'SELECT * FROM orders';
  const params = [];
  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/orders', (req, res) => {
  const items = req.body.items;
  db.run(
    `INSERT INTO orders (items, status) VALUES (?, 'Готовится')`,
    [JSON.stringify(items)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ orderId: this.lastID });
    }
  );
});
app.patch('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Не найден' });
    res.json({ success: true });
  });
});

// API: бронирования
app.get('/api/reservations', (req, res) => {
  db.all(`SELECT * FROM reservations`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/reservations', (req, res) => {
  const { first_name, last_name, email, people_count, table_number, reservation_time, notes } = req.body;
  db.run(
    `INSERT INTO reservations (first_name, last_name, email, people_count, table_number, reservation_time, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, people_count, table_number, reservation_time, notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});
app.delete('/api/reservations/:id', (req, res) => {
  db.run(`DELETE FROM reservations WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
