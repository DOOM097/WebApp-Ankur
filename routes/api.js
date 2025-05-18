const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Добавить бронирование
router.post('/reservations', (req, res) => {
  const { first_name, last_name, email, people_count, table_number, reservation_time, notes } = req.body;

  const sql = `INSERT INTO reservations 
    (first_name, last_name, email, people_count, table_number, reservation_time, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [first_name, last_name, email, people_count, table_number, reservation_time, notes], function(err) {
    if (err) {
      console.error('Ошибка при добавлении бронирования:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    res.json({ id: this.lastID });
  });
});

// Получить все бронирования
router.get('/reservations', (req, res) => {
  db.all('SELECT * FROM reservations ORDER BY reservation_time DESC', [], (err, rows) => {
    if (err) {
      console.error('Ошибка при загрузке бронирований:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    res.json(rows);
  });
});
router.delete('/reservations/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM reservations WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Ошибка при удалении бронирования:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    res.json({ message: 'Бронирование удалено' });
  });
});

// Получить все заказы
router.get('/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Ошибка при загрузке заказов:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    res.json(rows);
  });
});

// Обновить статус заказа
router.patch('/orders/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.run(sql, [status, id], function(err) {
    if (err) {
      console.error('Ошибка при обновлении заказа:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    res.json({ message: 'Статус обновлен' });
  });
});

// Удалить заказ
router.delete('/orders/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM orders WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Ошибка при удалении заказа:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    res.json({ message: 'Заказ удален' });
  });
});

module.exports = router;
