import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from './ui/Card';
import { Button }                from './ui/Button';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]   = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        { username, password }
      );
      // редирект по роли
      if (res.data.role === 'admin')  window.location.href = '/admin';
      else if (res.data.role === 'waiter') window.location.href = '/waiter';
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-1/3 p-4">
        <CardContent>
          <h2 className="text-2xl mb-4">Вход в аккаунт</h2>
          <form onSubmit={handleLogin}>
            <input
              className="w-full mb-2 p-2 border rounded"
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              className="w-full mb-4 p-2 border rounded"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <Button type="submit" className="w-full">Войти</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
