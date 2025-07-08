import React, { useState, useEffect } from 'react';
import Login from './Views/auth/Login'; // Asegúrate de que la ruta sea correcta
import Dashboard from './components/Dashboard';

// Estilos de PrimeReact y PrimeFlex
import 'primereact/resources/themes/saga-blue/theme.css'; // Puedes cambiar 'saga-blue' por tu tema preferido
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  return isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Login onLoginSuccess={handleLoginSuccess} />;
}

export default App;