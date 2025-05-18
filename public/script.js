// глобальная карта ID → название
let MENU_MAP = {};

document.addEventListener('DOMContentLoaded', () => {
  // загрузим меню сразу при старте
  initMenuMap().then(() => {
    setupOrderHandlers();
    loadCurrentOrders();
  });
});

async function initMenuMap() {
  try {
    const res = await fetch('/api/menu');
    const menu = await res.json();
    MENU_MAP = menu.reduce((map, item) => {
      map[item.id] = item.name;
      return map;
    }, {});
  } catch (e) {
    console.error('Не удалось загрузить карту меню', e);
  }
}

function setupOrderHandlers() {
  const btnNewOrder = document.getElementById('btn-new-order');
  const orderFormContainer = document.getElementById('order-form-container');
  const orderForm = document.getElementById('order-form');
  const cancelOrderBtn = document.getElementById('cancel-order');

  btnNewOrder.onclick = () => {
    orderFormContainer.style.display = 'block';
    loadMenuItems();
  };
  cancelOrderBtn.onclick = () => {
    orderFormContainer.style.display = 'none';
    orderForm.reset();
  };
  orderForm.onsubmit = async e => {
    e.preventDefault();
    const selected = Array.from(orderForm.querySelectorAll('input[name="menuItems"]:checked'))
                           .map(chk => Number(chk.value));
    if (!selected.length) {
      alert('Выберите хотя бы одну позицию');
      return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ items: selected })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Заказ создан, ID: ' + data.orderId);
      orderFormContainer.style.display = 'none';
      orderForm.reset();
      loadCurrentOrders();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };
}

async function loadMenuItems() {
  const list = document.getElementById('menu-items-list');
  list.innerHTML = '';
  // можно использовать MENU_MAP для подписей
  for (const id in MENU_MAP) {
    const div = document.createElement('div');
    div.innerHTML = `
      <label>
        <input type="checkbox" name="menuItems" value="${id}">
        ${MENU_MAP[id]}
      </label>
    `;
    list.appendChild(div);
  }
}

async function loadCurrentOrders() {
  const container = document.getElementById('current-orders-list');
  container.innerHTML = '';
  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();
    if (!orders.length) {
      container.textContent = 'Нет текущих заказов';
      return;
    }
    orders.forEach(order => {
      const div = document.createElement('div');
      div.className = 'border p-2 mb-2 rounded';
      let itemsHtml = '';
      try {
        const ids = JSON.parse(order.items);
        // заменяем каждый ID на название из MENU_MAP
        itemsHtml = ids.map(id => `<li>${MENU_MAP[id] || '—'}</li>`).join('');
      } catch {
        itemsHtml = '<li>Ошибка разбора</li>';
      }
      div.innerHTML = `
        <strong>Заказ #${order.id}</strong>
        <ul>${itemsHtml}</ul>
        <div>
          Статус: <span id="status-${order.id}">${order.status}</span>
          <button onclick="toggleStatus(${order.id})">Сменить</button>
          <button onclick="deleteOrder(${order.id})">Удалить</button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error('Ошибка загрузки заказов', e);
  }
}

// глобальные функции для кнопок
window.toggleStatus = async function(id) {
  const span = document.getElementById(`status-${id}`);
  const newStatus = span.textContent === 'Готовится' ? 'Забрали' : 'Готовится';
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ status: newStatus })
  });
  if (res.ok) span.textContent = newStatus;
  else alert('Не удалось сменить статус');
};

window.deleteOrder = async function(id) {
  if (!confirm('Удалить этот заказ?')) return;
  const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
  if (res.ok) loadCurrentOrders();
  else alert('Не удалось удалить заказ');
};
