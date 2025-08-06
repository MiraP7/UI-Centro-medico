// src/components/Unauthorized.jsx
import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import AuthService from '../Services/AuthService';

const authService = new AuthService();

const Unauthorized = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <div className="text-center">
                    <i className="pi pi-exclamation-triangle text-6xl text-orange-500 mb-3"></i>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Acceso Denegado
                    </h1>
                    <p className="text-gray-600 mb-4">
                        No tienes permisos para acceder a esta página.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Contacta al administrador si crees que esto es un error.
                    </p>
                    
                    <div className="flex flex-column gap-2">
                        <Button 
                            label="Ir al Inicio" 
                            icon="pi pi-home"
                            onClick={handleGoHome}
                            className="p-button-outlined"
                        />
                        <Button 
                            label="Cerrar Sesión" 
                            icon="pi pi-sign-out"
                            onClick={handleLogout}
                            severity="secondary"
                            className="p-button-text"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Unauthorized;
