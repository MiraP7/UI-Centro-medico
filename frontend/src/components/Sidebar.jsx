import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth/AuthContext';
import { ROLES } from '../routes/roles';
import '../styles/Sidebar.css'; // Mantén los estilos existentes

export default function Sidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      label: 'Home',
      path: '/home',
      icon: 'home',
      roles: [ROLES.ADMIN, ROLES.ASSISTANT]
    },
    {
      label: 'Pacientes',
      path: '/pacientes',
      icon: 'users',
      roles: [ROLES.ADMIN, ROLES.ASSISTANT]
    },
    {
      label: 'Médicos',
      path: '/medicos',
      icon: 'user-md',
      roles: [ROLES.ADMIN]
    },
    {
      label: 'Aseguradoras',
      path: '/aseguradoras',
      icon: 'building',
      roles: [ROLES.ADMIN]
    },
    {
      label: 'Facturación',
      path: '/facturacion',
      icon: 'file-invoice-dollar',
      roles: [ROLES.ADMIN, ROLES.ASSISTANT]
    },
    {
      label: 'Autorización',
      path: '/autorizacion',
      icon: 'check-circle',
      roles: [ROLES.ADMIN, ROLES.ASSISTANT]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="sidebar">
      <nav>
        <ul>
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <i className={`fas fa-${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="user-info">
        {user && (
          <>
            <span className="user-role">
              {user.role === ROLES.ADMIN ? 'Administrador' : 'Asistente'}
            </span>
            <span className="user-name">{user.name}</span>
          </>
        )}
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}