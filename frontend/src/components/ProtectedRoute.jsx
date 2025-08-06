// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../Services/AuthService';

const authService = new AuthService();

/**
 * Componente para proteger rutas basado en roles
 * @param {Object} props - Props del componente
 * @param {React.Component} props.children - Componente hijo a renderizar
 * @param {Array} props.allowedRoles - Roles permitidos para acceder a la ruta
 * @param {string} props.redirectTo - Ruta de redirección si no tiene acceso
 */
const ProtectedRoute = ({ 
    children, 
    allowedRoles = [], 
    redirectTo = '/unauthorized' 
}) => {
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Verificar si el usuario tiene el rol requerido
    const userRole = authService.getUserRole();
    
    // Si no se especifican roles, permitir acceso a usuarios autenticados
    if (allowedRoles.length === 0) {
        return children;
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (allowedRoles.includes(userRole)) {
        return children;
    }

    // Si no tiene permisos, redirigir
    return <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
