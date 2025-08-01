import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth/AuthContext';
import { ROLES } from '../routes/roles';
import './styles/Sidebar.css';

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

  const getRoleName = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'Administrador';
      case ROLES.ASSISTANT:
        return 'Asistente';
      default:
        return 'Usuario';
    }
  };

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
            <div className="user-details">
              <span className="user-role">
                <i className="fas fa-user-shield"></i>
                {getRoleName(user.role)}
              </span>
              <span className="user-name">
                <i className="fas fa-user"></i>
                {user.name}
              </span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Cerrar Sesión</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}