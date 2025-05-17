import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // здесь можно подключить глобальные стили или Tailwind

// «Входим» в DOM-элемент с id="root"
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
