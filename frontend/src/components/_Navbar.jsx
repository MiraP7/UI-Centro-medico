import React from 'react';
import './App.css';

function Navbar() {
  const handleOptionClick = (optionName) => {
    alert(`Opción por agregar: ${optionName}`);
  };

  return (
    <div className="app-navbar">   
      <div className="app-navbar-logo">Centro Médico</div>   
      <nav>
        <ul className="app-navbar-list">   
          <li className="app-navbar-item" onClick={() => handleOptionClick('Home')}>Home</li>   
          <li className="app-navbar-item" onClick={() => handleOptionClick('Pacientes')}>Pacientes</li>   
          <li className="app-navbar-item" onClick={() => handleOptionClick('Facturación')}>Facturación</li>   
          <li className="app-navbar-item" onClick={() => handleOptionClick('Autorización')}>Autorización</li>   
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
