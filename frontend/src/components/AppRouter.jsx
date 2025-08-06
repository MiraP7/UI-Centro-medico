// src/components/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Views/auth/Login';
import Dashboard from './Dashboard';
import PatientView from '../Views/PatientView';
import FacturacionView from '../Views/FacturacionView';
import AseguradoraView from '../Views/AseguradoraView';
import MedicoView from '../Views/MedicoView';
import UserView from '../Views/UserView';
import Unauthorized from './Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import AuthService from '../Services/AuthService';

const authService = new AuthService();

const AppRouter = () => {
    const isAuthenticated = authService.isAuthenticated();

    // Componente para renderizar módulos de autorización
    const AuthorizationModule = () => {
        return (
            <div className="card p-4 shadow-1 border-round-md">
                <h2 className="text-xl font-bold mb-3" style={{ color: '#3498db', textAlign: 'center' }}>
                    Módulo de Autorización
                </h2>
                <p className="text-center text-500">
                    Esta funcionalidad estará disponible próximamente.
                </p>
            </div>
        );
    };

    return (
        <Router>
            <Routes>
                {/* Ruta de login */}
                <Route 
                    path="/login" 
                    element={
                        isAuthenticated ? 
                        <Navigate to="/" replace /> : 
                        <Login onLoginSuccess={() => window.location.href = '/'} />
                    } 
                />

                {/* Ruta de acceso no autorizado */}
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Rutas protegidas */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'operador']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Módulo de Pacientes - Accesible para admin y operador */}
                <Route 
                    path="/pacientes" 
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'operador']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Módulo de Facturación - Accesible para admin y operador */}
                <Route 
                    path="/facturacion" 
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'operador']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Módulo de Autorización - Accesible para admin y operador */}
                <Route 
                    path="/autorizacion" 
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'operador']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Módulo de Médicos - Solo para admin */}
                <Route 
                    path="/medicos" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Módulo de Usuarios - Solo para admin */}
                <Route 
                    path="/usuarios" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Módulo de Aseguradoras - Solo para admin */}
                <Route 
                    path="/aseguradoras" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Ruta por defecto */}
                <Route 
                    path="*" 
                    element={
                        isAuthenticated ? 
                        <Navigate to="/" replace /> : 
                        <Navigate to="/login" replace />
                    } 
                />
            </Routes>
        </Router>
    );
};

export default AppRouter;
