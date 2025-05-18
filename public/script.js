document.addEventListener('DOMContentLoaded', () => {
  // --- Элементы интерфейса ---
  const btnNewOrder = document.getElementById('btn-new-order');
  const orderFormContainer = document.getElementById('order-form-container');
  const menuItemsList = document.getElementById('menu-items-list');
  const orderForm = document.getElementById('order-form');
  const cancelOrderBtn = document.getElementById('cancel-order');
  const currentOrdersList = document.getElementById('current-orders-list');

  const btnNewReservation = document.getElementById('btn-new-reservation');
  const reservationFormContainer = document.getElementById('reservation-form-container');
  const reservationForm = document.getElementById('reservation-form');
  const cancelReservationBtn = document.getElementById('cancel-reservation');
  const reservationsList = document.getElementById('reservations-list');

  const btnAddMenuItem = document.getElementById('btn-add-menu-item');
  const menuItemFormContainer = document.getElementById('menu-item-form-container');
  const menuItemForm = document.getElementById('menu-item-form');
  const cancelMenuItemBtn = document.getElementById('cancel-menu-item');

  // --- Заказы ---
  btnNewOrder.onclick = () => {
    orderFormContainer.style.display = 'block';
    loadMenuItems();
  };

  cancelOrderBtn.onclick = () => {
    orderFormContainer.style.display = 'none';
    menuItemsList.innerHTML = '';
  };

  orderForm.addEventListener('submit', e => {
    e.preventDefault();

    const selected = [...orderForm.querySelectorAll('input[name="menuItems"]:checked')].map(chk => Number(chk.value));

    if (selected.length === 0) {
      alert('Выберите хотя бы один пункт меню');
      return;
    }

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: selected })
    })
      .then(res => res.json())
      .then(() => {
        alert('Заказ создан');
        orderFormContainer.style.display = 'none';
        menuItemsList.innerHTML = '';
        loadCurrentOrders();
      });
  });

  function loadMenuItems() {
    fetch('/api/menu')
      .then(res => res.json())
      .then(menu => {
        menuItemsList.innerHTML = '';
        menu.forEach(item => {
          const div = document.createElement('div');
          div.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-1');
          div.innerHTML = `
            <div>
              <input type="checkbox" id="menu-item-${item.id}" value="${item.id}" name="menuItems" />
              <label for="menu-item-${item.id}">${item.name} — ${item.price} €</label>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteMenuItem(${item.id})">Удалить</button>
          `;
          menuItemsList.appendChild(div);
        });
      });
  }

  function loadCurrentOrders() {
    fetch('/api/orders?status=Готовится')
      .then(res => res.json())
      .then(orders => {
        currentOrdersList.innerHTML = '';
        if (orders.length === 0) {
          currentOrdersList.textContent = 'Нет текущих заказов';
          return;
        }
        orders.forEach(order => {
          const div = document.createElement('div');
          div.textContent = `Заказ #${order.id}, Статус: ${order.status}`;
          currentOrdersList.appendChild(div);
        });
      });
  }

  loadCurrentOrders();

  // --- Бронирования ---
  btnNewReservation.onclick = () => {
    reservationFormContainer.style.display = 'block';
  };

  cancelReservationBtn.onclick = () => {
    reservationFormContainer.style.display = 'none';
    reservationForm.reset();
  };

  reservationForm.addEventListener('submit', e => {
    e.preventDefault();

    const data = {
      first_name: reservationForm.first_name.value.trim(),
      last_name: reservationForm.last_name.value.trim(),
      email: reservationForm.email.value.trim(),
      people_count: Number(reservationForm.people_count.value),
      table_number: Number(reservationForm.table_number.value),
      reservation_time: reservationForm.reservation_time.value,
      notes: reservationForm.notes.value.trim()
    };

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(() => {
        alert('Бронирование создано');
        reservationFormContainer.style.display = 'none';
        reservationForm.reset();
        loadReservations();
      });
  });

  function loadReservations() {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(data => {
        reservationsList.innerHTML = '';
        if (data.length === 0) {
          reservationsList.textContent = 'Нет бронирований';
          return;
        }
        data.forEach(r => {
          const div = document.createElement('div');
          div.classList.add('border', 'p-2', 'mb-2', 'rounded');
          div.innerHTML = `
            <strong>${r.first_name} ${r.last_name}</strong> — столик ${r.table_number}<br/>
            Время: ${new Date(r.reservation_time).toLocaleString()}<br/>
            Людей: ${r.people_count}<br/>
            Почта: ${r.email}<br/>
            ${r.notes ? `Дополнительно: ${r.notes}` : ''}
            <br/>
            <button class="btn btn-danger btn-sm mt-2" data-id="${r.id}">Удалить</button>
          `;
          reservationsList.appendChild(div);

          div.querySelector('button').onclick = () => {
            if (confirm('Вы точно хотите удалить это бронирование?')) {
              fetch(`/api/reservations/${r.id}`, { method: 'DELETE' })
                .then(res => {
                  if (!res.ok) throw new Error('Ошибка при удалении');
                  loadReservations();
                })
                .catch(err => alert(err.message));
            }
          };
        });
      });
  }

  loadReservations();

  // --- Добавление позиции меню ---
  if (btnAddMenuItem) {
    btnAddMenuItem.onclick = () => {
      menuItemFormContainer.style.display = 'block';
    };
  }

  if (cancelMenuItemBtn) {
    cancelMenuItemBtn.onclick = () => {
      menuItemFormContainer.style.display = 'none';
      menuItemForm.reset();
    };
  }

  if (menuItemForm) {
    menuItemForm.addEventListener('submit', e => {
      e.preventDefault();

      const formData = new FormData(menuItemForm);
      const data = {
        name: formData.get('name').trim(),
        price: parseFloat(formData.get('price')),
        description: formData.get('description').trim(),
        weight: formData.get('weight') ? parseInt(formData.get('weight')) : null,
      };

      fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => {
          if (!res.ok) throw new Error('Ошибка при добавлении позиции меню');
          return res.json();
        })
        .then(() => {
          alert('Позиция меню добавлена');
          menuItemFormContainer.style.display = 'none';
          menuItemForm.reset();
          loadMenuItems();
        })
        .catch(err => alert(err.message));
    });
  }
});

// --- Вне DOMContentLoaded ---
// Это важно: deleteMenuItem должна быть глобальной
function deleteMenuItem(id) {
  if (!confirm("Удалить эту позицию?")) return;

  fetch(`/api/menu/${id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Ошибка удаления");
      }
      return response.json();
    })
    .then(() => {
      alert("Позиция удалена");
      location.reload(); // Обновить страницу после удаления
    })
    .catch(error => {
      console.error("Ошибка при удалении:", error);
      alert("Не удалось удалить позицию");
    });
}
