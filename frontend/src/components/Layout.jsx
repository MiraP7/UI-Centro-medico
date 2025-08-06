import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PanelMenu } from 'primereact/panelmenu';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { useAuth } from '../contexts/AuthContext';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';

// Definición de los colores para facilitar la referencia
const COLOR_AZUL_MARINO = '#2c3e50';
const COLOR_AZUL_CLARO = '#3498db';
const COLOR_BLANCO = '#ffffff';

export default function Layout() {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { logout, isAdmin, canAccessAdminModules, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigateTo = (path) => {
        navigate(path);
        setSidebarVisible(false);
    };

    // Función para verificar si una ruta está activa
    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    // Definición de los ítems del menú según el rol
    const getMenuItems = () => {
        console.log('Generando menú para usuario:', user);
        console.log('¿Es admin?', isAdmin());
        console.log('RolId del usuario:', user?.rolId);

        // Elementos básicos para todos los usuarios autenticados
        const commonItems = [
            {
                label: 'Home',
                icon: 'pi pi-fw pi-home',
                className: isActiveRoute('/') ? 'active-menu-item' : '',
                command: () => navigateTo('/')
            },
            {
                label: 'Pacientes',
                icon: 'pi pi-fw pi-users',
                className: isActiveRoute('/pacientes') ? 'active-menu-item' : '',
                command: () => navigateTo('/pacientes')
            },
            {
                label: 'Autorización',
                icon: 'pi pi-fw pi-check-square',
                className: isActiveRoute('/autorizacion') ? 'active-menu-item' : '',
                command: () => navigateTo('/autorizacion')
            }
        ];

        // Solo agregar elementos de administrador si el rolId es exactamente 100
        if (user?.rolId === 100) {
            console.log('Agregando módulos de administrador al menú');
            const adminItems = [
                {
                    label: 'Facturación',
                    icon: 'pi pi-fw pi-money-bill',
                    className: isActiveRoute('/facturacion') ? 'active-menu-item' : '',
                    command: () => navigateTo('/facturacion')
                },
                {
                    label: 'Médicos',
                    icon: 'pi pi-fw pi-user-plus',
                    className: isActiveRoute('/medicos') ? 'active-menu-item' : '',
                    command: () => navigateTo('/medicos')
                },
                {
                    label: 'Usuarios',
                    icon: 'pi pi-fw pi-id-card',
                    className: isActiveRoute('/usuarios') ? 'active-menu-item' : '',
                    command: () => navigateTo('/usuarios')
                },
                {
                    label: 'Aseguradoras',
                    icon: 'pi pi-fw pi-shield',
                    className: isActiveRoute('/aseguradoras') ? 'active-menu-item' : '',
                    command: () => navigateTo('/aseguradoras')
                }
            ];
            return [...commonItems, ...adminItems];
        } else {
            console.log('Usuario operador, mostrando solo módulos básicos');
            return commonItems;
        }
    };

    return (
        <div className="">
            {/* Sidebar para el PanelMenu */}
            <Sidebar
                visible={sidebarVisible}
                onHide={() => setSidebarVisible(false)}
                showCloseIcon={true}
                baseZIndex={9999}
                className="w-20rem icons-bar"
            >
                <h3 className="mb-3 pl-3 text-2xl font-semibold" style={{ color: COLOR_BLANCO, textAlign: 'center' }}>
                    Menú Principal
                </h3>
                <PanelMenu model={getMenuItems()} className="w-full sidebar-panelmenu" />

                {/* Información del usuario */}
                <div className="mt-4 p-3 border-top-1 border-300">
                    <div className="text-sm" style={{ color: COLOR_BLANCO }}>
                        <p className="m-0"><strong>Usuario:</strong> {user?.usuario || 'Usuario'}</p>
                        <p className="m-0"><strong>Rol:</strong> {user?.rolId === 100 ? 'Administrador' : 'Operador'}</p>
                        <p className="m-0"><strong>RolId:</strong> {user?.rolId || 'N/A'}</p>
                    </div>
                </div>
            </Sidebar>

            {/* HEADER */}
            <header
                style={{ backgroundColor: COLOR_AZUL_MARINO }}
                className="flex align-items-center justify-content-between p-3 shadow-2 mb-4"
            >
                <div className="flex align-items-center gap-3">
                    <Button
                        icon="pi pi-bars"
                        className="p-button-text p-button-plain p-button-lg"
                        style={{ color: COLOR_BLANCO }}
                        onClick={() => setSidebarVisible(true)}
                    />
                    <i className="pi pi-heart-fill" style={{ color: COLOR_AZUL_CLARO, fontSize: '2.5rem' }}></i>
                    <h1 className="text-4xl font-bold m-0" style={{ color: COLOR_BLANCO }}>Health State</h1>
                </div>
                <div className="flex align-items-center gap-3">
                    <span className="text-sm" style={{ color: COLOR_BLANCO }}>
                        Bienvenido, {user?.usuario || 'Usuario'} ({user?.rolId === 100 ? 'Admin' : 'Operador'})
                    </span>
                    <Button
                        label="Cerrar Sesión"
                        icon="pi pi-sign-out"
                        className="p-button-danger p-button-sm"
                        onClick={handleLogout}
                    />
                </div>
            </header>

            {/* Contenido principal */}
            <div className="p-4">
                <Outlet />
            </div>

            <style jsx>{`
        .active-menu-item {
          background-color: rgba(52, 152, 219, 0.2) !important;
          border-left: 4px solid #3498db !important;
        }
        
        .icons-bar {
          background-color: #273747 !important;
        }
        
        .sidebar-panelmenu .p-panelmenu-content {
          background-color: transparent !important;
        }
        
        .sidebar-panelmenu .p-menuitem-link {
          color: #ffffff !important;
        }
        
        .sidebar-panelmenu .p-menuitem-link:hover {
          background-color: rgba(52, 152, 219, 0.1) !important;
        }
      `}</style>
        </div>
    );
}
