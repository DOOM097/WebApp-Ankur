let MENU_MAP = {};

document.addEventListener('DOMContentLoaded', () => {
  loadMenu();
  setupOrders();
  setupReservations();
  setupMenuFAB();
});

// --- МЕНЮ ---
async function loadMenu() {
  const res = await fetch('/api/menu');
  const arr = await res.json();
  MENU_MAP = arr.reduce((m,i)=>(m[i.id]=i.name,m),{});
  renderOrders();
  renderMenuPanel();
}

// --- ЗАКАЗЫ ---
function setupOrders() {
  const btn = document.getElementById('btn-new-order');
  const formC = document.getElementById('order-form-container');
  const form = document.getElementById('order-form');
  const btnCancel = document.getElementById('cancel-order');

  btn.onclick = () => {
    formC.style.display = 'block';
    renderOrderFormMenu();
  };
  btnCancel.onclick = () => {
    form.reset();
    formC.style.display = 'none';
  };

  form.onsubmit = async e => {
    e.preventDefault();
    const selected = Array.from(form.querySelectorAll('input[name="menuItems"]:checked')).map(chk=>+chk.value);
    await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:selected})});
    form.reset();
    formC.style.display = 'none';
    renderOrders();
    renderHistory();
  };
}

function renderOrderFormMenu() {
  const c = document.getElementById('menu-items-list');
  c.innerHTML = '';
  for (let id in MENU_MAP) {
    c.insertAdjacentHTML('beforeend',`
      <div class="menu-item">
        <label><input type="checkbox" name="menuItems" value="${id}"> ${MENU_MAP[id]}</label>
      </div>`);
  }
}

async function renderOrders() {
  const c = document.getElementById('current-orders-list');
  c.innerHTML = '';
  const res = await fetch('/api/orders?status=Готовится');
  const arr = await res.json();
  if (!arr.length) return c.textContent='Нет текущих+';
  arr.forEach(o=>{
    const items = JSON.parse(o.items).map(i=>MENU_MAP[i]).join(', ');
    c.insertAdjacentHTML('beforeend',`
      <div class="order-item mb-2">
        <strong>#${o.id}</strong>: ${items}
        <button class="btn btn-sm btn-danger ms-2" onclick="archiveOrder(${o.id})">В архив</button>
      </div>`);
  });
}

window.archiveOrder=async id=>{
  await fetch(`/api/orders/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'Забрали'})});
  renderOrders(); renderHistory();
};

// --- ИСТОРИЯ ---
async function renderHistory(){
  const c = document.getElementById('past-orders-list');
  c.innerHTML = '';
  const res=await fetch('/api/orders?status=Забрали');
  const arr=await res.json();
  if(!arr.length) return c.textContent='Нет истории';
  arr.forEach(o=>{
    const items=JSON.parse(o.items).map(i=>MENU_MAP[i]).join(', ');
    c.insertAdjacentHTML('beforeend',`
      <div class="order-item mb-2"><strong>#${o.id}</strong>: ${items}</div>`);
  });
}

// --- БРОНИРОВАНИЯ ---
function setupReservations(){
  const btn = document.getElementById('btn-new-reservation');
  const c = document.getElementById('reservation-form-container');
  const form = document.getElementById('reservation-form');
  const btnCancel = document.getElementById('cancel-reservation');

  btn.onclick=()=>c.style.display='block';
  btnCancel.onclick=()=>{
    form.reset(); c.style.display='none';
  };

  form.onsubmit=async e=>{
    e.preventDefault();
    const f=form;
    const data={
      first_name:f.first_name.value,
      last_name:f.last_name.value,
      email:f.email.value,
      people_count:+f.people_count.value,
      table_number:+f.table_number.value,
      reservation_time:f.reservation_time.value,
      notes:f.notes.value
    };
    await fetch('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    form.reset(); c.style.display='none'; renderReservations();
  };
  renderReservations();
}

window.renderReservations=async()=>{
  const c=document.getElementById('reservations-list');
  c.innerHTML='';
  const res=await fetch('/api/reservations');
  const arr=await res.json();
  if(!arr.length) return c.textContent='Нет брони';
  arr.forEach(r=>{
    c.insertAdjacentHTML('beforeend',`
      <div class="order-item mb-2">
        <strong>${r.first_name} ${r.last_name}</strong><br>
        Столик ${r.table_number}, ${r.people_count} чел.<br>
        Время: ${new Date(r.reservation_time).toLocaleString()}<br>
        ${r.notes?`<em>Комментарий:</em> ${r.notes}<br>`:''}
        <button class="btn btn-sm btn-danger" onclick="deleteReservation(${r.id})">Удалить</button>
      </div>`);
  });
};

window.deleteReservation=async id=>{
  await fetch(`/api/reservations/${id}`,{method:'DELETE'}); renderReservations();
};

// --- FAB МЕНЮ ---
function setupMenuFAB(){
  const fab=document.getElementById('fab');
  const p=document.getElementById('menu-panel');
  const f=document.getElementById('menu-add-form');
  fab.onclick=()=>p.style.display='block';
  f.onsubmit=async e=>{
    e.preventDefault();
    const d={
      name:f.name.value, price:+f.price.value,
      description:f.description.value, weight:+f.weight.value||0
    };
    await fetch('/api/menu',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
    f.reset(); p.style.display='none'; loadMenu();
  };
}

async function renderMenuPanel(){
  const d=document.getElementById('menu-items-display');
  d.innerHTML='';
  const res=await fetch('/api/menu');
  const arr=await res.json();
  arr.forEach(i=>{
    d.insertAdjacentHTML('beforeend',`
      <div class="menu-item mb-2">
        <strong>${i.name}</strong><br>${i.price.toFixed(2)} € — ${i.weight} г<br>
        <button class="btn btn-sm btn-danger" onclick="deleteMenuItem(${i.id})">Удалить</button>
      </div>`);
  });
}

window.deleteMenuItem=async id=>{
  await fetch(`/api/menu/${id}`,{method:'DELETE'}); loadMenu(); renderMenuPanel();
};
