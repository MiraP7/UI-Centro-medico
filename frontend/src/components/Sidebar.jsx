import React from 'react';

export default function Sidebar({ onMenuClick, activeView, onLogout }) {
  // ... Lógica y JSX para la barra lateral del menú ...
  return (
    <div className="sidebar">
        {/* ... Contenido del menú y botón de logout ... */}
        <nav>
          <ul>
            <li onClick={() => onMenuClick('home')}>Home</li>
            <li onClick={() => onMenuClick('pacientes')}>Pacientes</li>
            <li onClick={() => onMenuClick('facturacion')}>Facturación</li>
            <li onClick={() => onMenuClick('autorizacion')}>Autorización</li>
          </ul>
        </nav>
        <button onClick={onLogout}>Cerrar Sesión</button>
    </div>
  )
}