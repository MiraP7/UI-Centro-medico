import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PanelMenu } from 'primereact/panelmenu';
import AppointmentRegistrationForm from './AppointmentRegistrationForm';
import { Sidebar } from 'primereact/sidebar';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import '/src/App.css';
import PatientView from '/src/Views/PatientView';
import FacturacionView from '/src/Views/FacturacionView.jsx';
import AseguradoraView from '/src/Views/AseguradoraView.jsx';
import MedicoView from '/src/Views/MedicoView';

const initialAppointments = [
  // ... (tus datos de citas no cambian)
  { id: 1, time: '09:00 AM', patient: 'Juan Pérez', reason: 'Consulta General' },
  { id: 2, time: '10:30 AM', patient: 'Ana Gómez', reason: 'Revisión Dental' },
  { id: 3, time: '11:00 AM', patient: 'Pedro López', reason: 'Vacunación' },
];

const COLOR_AZUL_MARINO = '#2c3e50';
const COLOR_AZUL_CLARO = '#3498db';
const COLOR_BLANCO = '#ffffff';

export default function Dashboard({ onLogout }) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // PASO 1: Reemplazar los estados de los modales por uno solo
  const [activeView, setActiveView] = useState('home');

  const handleAppointmentRegistered = (newAppointment) => {
    console.log('Cita Registrada:', newAppointment);
    setAppointments(prev => [...prev, { ...newAppointment, id: Date.now(), patient: newAppointment.patientName || 'Nuevo Paciente' }]);
    setShowAppointmentModal(false);
  };

  // PASO 2: Actualizar los comandos del menú
  const items = [
    { label: 'Home', icon: 'pi pi-fw pi-home', command: () => { setActiveView('home'); setSidebarVisible(false); } },
    { label: 'Pacientes', icon: 'pi pi-fw pi-users', command: () => { setActiveView('pacientes'); setSidebarVisible(false); } },
    { label: 'Facturación', icon: 'pi pi-fw pi-money-bill', command: () => { setActiveView('facturacion'); setSidebarVisible(false); } },
    { label: 'Autorización', icon: 'pi pi-fw pi-check-square', command: () => { /* Implementar si es necesario */ setSidebarVisible(false); } },
    { label: 'Medicos', icon: 'pi pi-fw pi-user-md', command: () => { setActiveView('medicos'); setSidebarVisible(false); } },
    { label: 'Usuarios', icon: 'pi pi-fw pi-id-card', command: () => { /* Implementar si es necesario */ setSidebarVisible(false); } },
    { label: 'Aseguradora', icon: 'pi pi-fw pi-shield', command: () => { setActiveView('aseguradora'); setSidebarVisible(false); } }
  ];

  // PASO 4: Función para renderizar la vista activa
  const renderActiveView = () => {
    switch (activeView) {
      case 'pacientes':
        return <PatientView />;
      case 'facturacion':
        return <FacturacionView />;
      case 'aseguradora':
        return <AseguradoraView />;
      case 'medicos':
        return <MedicoView />;
      case 'home':
      default:
        return (
          <div className="container-citas col-12">
            <div className='bnt-registrar'>
              <Button label="Registrar Cita" icon="pi pi-calendar-plus" className="p-button-info p-button-raised p-2" onClick={() => setShowAppointmentModal(true)} />
            </div>
            <div className="card p-2 shadow-1 border-round-md">
              <h2 className="text-xl font-bold mb-3" style={{ color: COLOR_AZUL_CLARO, textAlign: 'center' }}>Citas</h2>
              <DataTable value={appointments} paginator rows={9} emptyMessage="No hay citas programadas para hoy.">
                <Column field="time" header="Hora"></Column>
                <Column field="patient" header="Paciente"></Column>
                <Column field="reason" header="Motivo"></Column>
              </DataTable>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} className="w-20rem" style={{ backgroundColor: COLOR_AZUL_MARINO }}>
        <h3 className="mb-3 pl-3 text-2xl font-semibold" style={{ color: COLOR_BLANCO, textAlign: 'center' }}>Menú Principal</h3>
        <PanelMenu model={items} className="w-full sidebar-panelmenu" />
      </Sidebar>

      <header style={{ backgroundColor: COLOR_AZUL_MARINO }} className="flex align-items-center justify-content-between p-3 shadow-2 mb-4">
        <div className="flex align-items-center gap-3">
          <Button icon="pi pi-bars" className="p-button-text p-button-plain p-button-lg" style={{ color: COLOR_BLANCO }} onClick={() => setSidebarVisible(true)} />
          <i className="pi pi-heart-fill" style={{ color: COLOR_AZUL_CLARO, fontSize: '2.5rem' }}></i>
          <h1 className="text-4xl font-bold m-0" style={{ color: COLOR_BLANCO }}>Health State</h1>
        </div>
        <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-danger p-button-sm" onClick={onLogout} />
      </header>

      <div className="grid m-4">
        {/* El contenido principal ahora es manejado por renderActiveView */}
        {renderActiveView()}
      </div>

      {/* El Dialog para Registrar Cita sigue siendo un modal */}
      <Dialog header="Registrar Cita" visible={showAppointmentModal} style={{ width: '50vw', minWidth: '350px' }} onHide={() => setShowAppointmentModal(false)} modal>
        <AppointmentRegistrationForm
          onAppointmentRegistered={handleAppointmentRegistered}
          onCancel={() => setShowAppointmentModal(false)}
        />
      </Dialog>
      
      {/* PASO 3: Los Dialog para las vistas principales se eliminaron de aquí */}
    </div>
  );
}