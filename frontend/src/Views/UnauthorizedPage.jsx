import React from 'react';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div className="text-center max-w-30rem">
                <i className="pi pi-exclamation-triangle" style={{ fontSize: '4rem', color: '#f59e0b', marginBottom: '2rem' }}></i>

                <h1 className="text-4xl font-bold mb-3" style={{ color: '#ef4444' }}>
                    Acceso No Autorizado
                </h1>

                <Message
                    severity="warn"
                    text="No tienes permisos para acceder a esta sección. Esta área está restringida para administradores."
                    className="mb-4 w-full"
                />

                <div className="bg-gray-50 border-round p-4 mb-4">
                    <h3 className="text-lg font-semibold mb-2">Información de tu cuenta:</h3>
                    <p className="m-0"><strong>Usuario:</strong> {user?.usuario || 'Usuario'}</p>
                    <p className="m-0"><strong>Rol:</strong> {isAdmin() ? 'Administrador' : 'Operador'}</p>
                    <p className="m-0 mt-2 text-sm text-600">
                        Como operador, tienes acceso a: Home, Pacientes y Autorización.
                    </p>
                </div>

                <Button
                    label="Volver al Inicio"
                    icon="pi pi-home"
                    className="p-button-primary p-button-lg"
                    onClick={handleGoBack}
                />
            </div>
        </div>
    );
}
