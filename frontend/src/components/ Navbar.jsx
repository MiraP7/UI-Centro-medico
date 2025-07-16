import React from 'react';
import './App.css';

function Navbar() {
  const handleOptionClick = (optionName) => {
    alert(`Opción por agregar: ${optionName}`);
  };

  return (
    <div className="app-navbar"> {/* Usar clase CSS */}
      <div className="app-navbar-logo">Centro Médico</div> {/* Usar clase CSS */}
      <nav>
        <ul className="app-navbar-list"> {/* Usar clase CSS */}
          <li className="app-navbar-item" onClick={() => handleOptionClick('Home')}>Home</li> {/* Usar clase CSS */}
          <li className="app-navbar-item" onClick={() => handleOptionClick('Pacientes')}>Pacientes</li> {/* Usar clase CSS */}
          <li className="app-navbar-item" onClick={() => handleOptionClick('Facturación')}>Facturación</li> {/* Usar clase CSS */}
          <li className="app-navbar-item" onClick={() => handleOptionClick('Autorización')}>Autorización</li> {/* Usar clase CSS */}
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
