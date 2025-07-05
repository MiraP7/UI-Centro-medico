import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';

// Estilos de PrimeReact y PrimeFlex
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';

// Importa la hoja de estilos CSS dedicada para el login
import './Login.css';

// Importa la imagen de fondo (asegúrate de que la ruta sea correcta según tu estructura)
import backgroundImage from '../../components/Image.jpg';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('medico@healthstate.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Lógica de API simulada
    if (email === "medico@healthstate.com" && password === "password123") {
      localStorage.setItem('authToken', 'fake-jwt-token');
      onLoginSuccess();
    } else {
      setError('Credenciales incorrectas. Intente de nuevo.');
    }
  };

  return (
    // Contenedor principal con la imagen de fondo.
    // La imagen se sigue aplicando aquí para que el bundler (Vite/Webpack) la procese correctamente.
    <div
      className="login-container"
      style={{
        backgroundImage: `url('${backgroundImage}')`
      }}
    >
      {/* Tarjeta del formulario de login */}
      <div className="login-card p-fluid sm:w-full md:w-6 lg:w-4 xl:w-3 p-6 border-round shadow-2">
        
        {/* Logo/Icono y Título */}
        <div className="login-header">
          <i className="pi pi-heart-fill"></i>
          <h2 className="text-2xl font-bold mt-3 mb-0">Iniciar Sesión</h2>
          <p className="text-sm mt-1">Bienvenido de nuevo a Health State</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-2 text-center">Correo Electrónico</label>
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
            <label htmlFor="password" className="block font-medium mb-2 text-center">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              feedback={false}
              toggleMask
              inputClassName="w-full" // La clase del input interno de Password
            />
          </div>
          {error && <p className="login-error text-xs mb-3">{error}</p>}
          <Button
            type="submit"
            label="Ingresar"
            className="login-button w-full p-button-raised"
          />
        </form>
      </div>
    </div>
  );
}
