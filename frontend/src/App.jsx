// src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import RegistroPaciente from './components/RegistroPaciente';
import './App.css'; // Archivo de estilos principal

function App() {
  // Este estado controla si el usuario está autenticado o no
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Al cargar la app, revisamos si ya hay un token en el localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // En un caso real, validaríamos el token con el backend.
      // Por ahora, si existe, asumimos que la sesión es válida.
      setIsAuthenticated(true);
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  // Estilos para el botón de logout
  const logoutButtonStyles = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: '#e53e3e',
    color: 'white'
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        // Si el usuario ESTÁ autenticado, muestra el contenido principal
        <>
          <header>
            <h1>Sistema de Gestión Hospitalaria HealthState</h1>
            <button onClick={handleLogout} style={logoutButtonStyles}>Cerrar Sesión</button>
          </header>
          <main>
            <RegistroPaciente />
          </main>
        </>
      ) : (
        // Si el usuario NO está autenticado, muestra el componente de Login
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}

export default App;