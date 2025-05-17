import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import AdminPage from './components/AdminPage';
import WaiterPage from './components/WaiterPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Корень сайта — форма входа */}
        <Route path="/"        element={<LoginForm />} />
        {/* Страница для роли «admin» */}
        <Route path="/admin"   element={<AdminPage />} />
        {/* Страница для роли «waiter» */}
        <Route path="/waiter"  element={<WaiterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
