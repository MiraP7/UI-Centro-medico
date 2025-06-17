import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('medico@healthstate.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    // Lógica de API simulada
    if (email === "medico@healthstate.com" && password === "password123") {
      localStorage.setItem('authToken', 'fake-jwt-token');
      onLoginSuccess();
    } else {
      setError('Credenciales incorrectas. Intente de nuevo.');
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
      <div className="p-fluid sm:w-full md:w-6 lg:w-4 xl:w-3 p-6 bg-white border-round shadow-2">
        <h2 className="text-center text-2xl font-bold mb-5">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-900 font-medium mb-2">Correo Electrónico</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-900 font-medium mb-2">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              feedback={false}
              toggleMask
              inputClassName="w-full"
            />
          </div>
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <Button type="submit" label="Ingresar" className="w-full" />
        </form>
      </div>
    </div>
  );
}