import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import HomeView from "/home/robert/Documents/UI centro medico/frontend/src/components/MainLayout.jsx";
import PatientView from '../views/PatientView.jsx';
import FacturacionView from '../views/FacturacionView.jsx';
import AutorizacionView from '../views/AutorizacionView.jsx';

export default function MainLayout({ onLogout }) {
    const [activeView, setActiveView] = useState('home');

    // Función para renderizar la vista activa
    const renderActiveView = () => {
        switch (activeView) {
            case 'pacientes': return <PatientView />;
            case 'facturacion': return <FacturacionView />;
            case 'autorizacion': return <AutorizacionView />;
            case 'home':
            default: return <HomeView />;
        }
    };

    return (
        <div className="main-layout">
            <Sidebar onMenuClick={setActiveView} activeView={activeView} onLogout={onLogout} />
            <div className="content-area">
                {renderActiveView()}
            </div>
        </div>
    );
}