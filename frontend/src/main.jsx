import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Si tienes un index.css global, impórtalo aquí
// import './index.css'; 

// Proveedor de PrimeReact para configuraciones globales (opcional pero recomendado)
import { PrimeReactProvider } from 'primereact/api';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>
);