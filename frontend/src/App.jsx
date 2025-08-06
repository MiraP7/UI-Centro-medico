import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './Views/auth/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './Views/HomePage';
import PatientView from './Views/PatientView';
import SolicitudView from './Views/SolicitudView';
import FacturacionView from './Views/FacturacionView';
import MedicoView from './Views/MedicoView';
import UserView from './Views/UserView';
import AseguradoraView from './Views/AseguradoraView';
import UnauthorizedPage from './Views/UnauthorizedPage';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="flex flex-column align-items-center">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#3498db' }}></i>
          <p className="mt-3 text-xl">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta de login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />

      {/* Página de acceso no autorizado */}
      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <UnauthorizedPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas con layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Rutas disponibles para todos los usuarios autenticados */}
        <Route index element={<HomePage />} />
        <Route path="pacientes" element={<PatientView />} />
        <Route path="autorizacion" element={<SolicitudView />} />

        {/* Rutas solo para administradores */}
        <Route
          path="facturacion"
          element={
            <ProtectedRoute requireAdmin={true}>
              <FacturacionView />
            </ProtectedRoute>
          }
        />
        <Route
          path="medicos"
          element={
            <ProtectedRoute requireAdmin={true}>
              <MedicoView />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UserView />
            </ProtectedRoute>
          }
        />
        <Route
          path="aseguradoras"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AseguradoraView />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Ruta catch-all - redirigir a login si no está autenticado, sino al home */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;