import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PanelMenu } from 'primereact/panelmenu';
import { Sidebar } from 'primereact/sidebar';
import AppointmentRegistrationForm from './AppointmentRegistrationForm';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import '../App.css'; // Ajustado a ruta relativa también
import PatientView from '../Views/PatientView';
import FacturacionView from '../Views/FacturacionView';

const initialAppointments = [
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
  const [showPatientViewModal, setShowPatientViewModal] = useState(false);
  const [activeView, setActiveView] = useState('home');

  const handleAppointmentRegistered = (newAppointment) => {
    console.log('Cita Registrada:', newAppointment);
    setAppointments(prev => [...prev, { ...newAppointment, id: Date.now(), patient: newAppointment.patientName || 'Nuevo Paciente' }]);
    setShowAppointmentModal(false);
  };
  
  const items = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      command: () => {
        setActiveView('home');
        setSidebarVisible(false);
      },
    },
    {
      label: 'Pacientes',
      icon: 'pi pi-fw pi-users',
      command: () => {
        setShowPatientViewModal(true);
        setSidebarVisible(false);
      },
    },
    {
      label: 'Facturación',
      icon: 'pi pi-fw pi-money-bill',
      command: () => {
        setActiveView('facturacion');
        setSidebarVisible(false);
      },
    },
    {
      label: 'Autorización', icon: 'pi pi-fw pi-check-square',
    },
    {
      label: 'Medicos', icon: 'pi pi-fw pi-user-md',
    },
    {
      label: 'Usuarios', icon: 'pi pi-fw pi-id-card',
    },
    {
      label: 'Aseguradora', icon: 'pi pi-fw pi-shield',
    }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'facturacion':
        return <FacturacionView />;
      case 'home':
      default:
        return (
          <div className="grid">
            <div className="col-12 m-3 md:col-8">
              <div className="card p-3 shadow-1 border-round-md">
                <h2 className="text-xl font-bold mb-3" style={{ color: COLOR_AZUL_CLARO, textAlign: 'center' }}>Citas del Día</h2>
                <DataTable value={appointments} responsiveLayout="scroll" emptyMessage="No hay citas programadas para hoy."
                  paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} citas"
                >
                  <Column field="time" header="Hora"></Column>
                  <Column field="patient" header="Paciente"></Column>
                  <Column field="reason" header="Motivo"></Column>
                </DataTable>
              </div>
            </div>
            <div className="col-12 md:col-4">
              <div className="card shadow-1 border-round-md">
                <h2 className="text-xl font-semibold mb-3" style={{ textAlign: 'center' }}>Acciones Rápidas</h2>
                <div className="flex flex-column gap-3">
                  <Button label="Registrar Cita" icon="pi pi-calendar-plus" className="p-button-info p-button-raised p-button-sm" onClick={() => setShowAppointmentModal(true)} />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)}
        showCloseIcon={true} baseZIndex={9999} className="w-20rem" style={{ backgroundColor: COLOR_AZUL_MARINO }}>
        <h3 className="mb-3 pl-3 text-2xl font-semibold" style={{ color: COLOR_BLANCO, textAlign: 'center' }}>Menú Principal</h3>
        <PanelMenu model={items} className="w-full sidebar-panelmenu" />
      </Sidebar>

      <header style={{ backgroundColor: COLOR_AZUL_MARINO }}
        className="flex align-items-center justify-content-between p-3 shadow-2 mb-4">
        <div className="flex align-items-center gap-3">
          <Button icon="pi pi-bars" className="p-button-text p-button-plain p-button-lg" style={{ color: COLOR_BLANCO }} onClick={() => setSidebarVisible(true)} />
          <i className="pi pi-heart-fill" style={{ color: COLOR_AZUL_CLARO, fontSize: '2.5rem' }}></i>
          <h1 className="text-4xl font-bold m-0" style={{ color: COLOR_BLANCO }}>Health State</h1>
        </div>
        <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-danger p-button-sm" onClick={onLogout} />
      </header>

      <div className="main-content">
        {renderActiveView()}
      </div>

      <Dialog header="Registrar Cita" visible={showAppointmentModal} style={{ width: '50vw', minWidth: '350px' }} onHide={() => setShowAppointmentModal(false)} modal>
        <AppointmentRegistrationForm
          onAppointmentRegistered={handleAppointmentRegistered}
          onCancel={() => setShowAppointmentModal(false)}
        />
      </Dialog>

      <Dialog
        header="Gestión de Pacientes"
        visible={showPatientViewModal}
        style={{ width: '80vw', minWidth: '700px', height: '80vh' }}
        onHide={() => setShowPatientViewModal(false)}
        modal
      >
        <PatientView onClose={() => setShowPatientViewModal(false)} />
      </Dialog>
    </div>
  );
}