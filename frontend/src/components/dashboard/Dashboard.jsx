import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PanelMenu } from 'primereact/panelmenu';
import { Sidebar } from 'primereact/sidebar';
import PatientRegistrationForm from '../patient/PatientRegistrationForm.jsx';
import AppointmentRegistrationForm from '../appointment/AppointmentRegistrationForm.jsx';
import PatientView from '/src/Views/PatientView';

// 1. Importa el nuevo archivo CSS
import './Dashboard.css';

// Importaciones de PrimeReact y CSS global (se mantienen igual)
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import '/src/App.css';

const initialAppointments = [
  // ... tu lista de citas se mantiene igual
  { id: 1, time: '09:00 AM', patient: 'Juan Pérez', reason: 'Consulta General' },
  { id: 2, time: '10:30 AM', patient: 'Ana Gómez', reason: 'Revisión Dental' },
  { id: 3, time: '11:00 AM', patient: 'Pedro López', reason: 'Vacunación' },
  // ... etc
];


export default function Dashboard({ onLogout }) {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showPatientViewModal, setShowPatientViewModal] = useState(false);

  // ... (toda tu lógica de handlePatientRegistered y handleAppointmentRegistered se mantiene igual)
  const handlePatientRegistered = (newPatient) => {
    console.log('Paciente Registrado:', newPatient);
    setShowPatientModal(false);
  };

  const handleAppointmentRegistered = (newAppointment) => {
    console.log('Cita Registrada:', newAppointment);
    setAppointments(prev => [...prev, { ...newAppointment, id: Date.now(), patient: newAppointment.patientName || 'Nuevo Paciente' }]);
    setShowAppointmentModal(false);
  };

  const items = [
    { label: 'Home', icon: 'pi pi-fw pi-home' },
    {
      label: 'Pacientes',
      icon: 'pi pi-fw pi-users',
      command: () => {
        setShowPatientViewModal(true);
        setSidebarVisible(false);
      },
    },
    { label: 'Facturación', icon: 'pi pi-fw pi-money-bill' },
    { label: 'Autorización', icon: 'pi pi-fw pi-check-square' },
    { label: 'Medicos', icon: 'pi pi-fw pi-user-md' },
    { label: 'Usuarios', icon: 'pi pi-fw pi-id-card' },
    { label: 'Aseguradora', icon: 'pi pi-fw pi-shield' }
  ];

  // 3. Se reemplazan los 'style' por 'className'
  return (
    <div className="p-4">
      <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)}
        showCloseIcon={true}
        baseZIndex={9999}
        className="w-20rem dashboard-sidebar" // Clase añadida
      >
        <h3 className="mb-3 pl-3 text-2xl font-semibold sidebar-title">Menú Principal</h3>
        <PanelMenu model={items} className="w-full sidebar-panelmenu" />
      </Sidebar>

      <header className="flex align-items-center justify-content-between p-3 shadow-2 mb-4 border-round-md dashboard-header">
        <div className="flex align-items-center gap-3">
          <Button icon="pi pi-bars" className="p-button-text p-button-plain p-button-lg header-menu-button" onClick={() => setSidebarVisible(true)} />
          <i className="pi pi-heart-fill header-logo-icon"></i>
          <h1 className="text-4xl font-bold m-0 header-title">Health State</h1>
        </div>
        <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-danger p-button-sm" onClick={onLogout} />
      </header>

      <div className="grid">
        <div className="col-12 md:col-8">
          <div className="card shadow-1 border-round-md">
            <h2 className="text-xl font-bold mb-3 card-title card-title-appointments">Citas del Día</h2>
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
            <h2 className="text-xl font-semibold mb-3 card-title">Acciones Rápidas</h2>
            <div className="flex flex-column gap-3">
              <Button label="Registrar Paciente" icon="pi pi-user-plus" className="p-button-success p-button-raised p-button-sm" onClick={() => setShowPatientModal(true)} />
              <Button label="Registrar Cita" icon="pi pi-calendar-plus" className="p-button-info p-button-raised p-button-sm" onClick={() => setShowAppointmentModal(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* Los Dialogs mantienen su 'style' para el tamaño*/}
      <Dialog header="Registrar Paciente" visible={showPatientModal} style={{ width: '50vw', minWidth: '350px' }} onHide={() => setShowPatientModal(false)} modal>
        <PatientRegistrationForm onPatientRegistered={handlePatientRegistered} onCancel={() => setShowPatientModal(false)} />
      </Dialog>

      <Dialog header="Registrar Cita" visible={showAppointmentModal} style={{ width: '50vw', minWidth: '350px' }} onHide={() => setShowAppointmentModal(false)} modal>
        <AppointmentRegistrationForm
          onAppointmentRegistered={handleAppointmentRegistered}
          onCancel={() => setShowAppointmentModal(false)}
        />
      </Dialog>

      <Dialog header="Gestión de Pacientes" visible={showPatientViewModal}
        style={{ width: '80vw', minWidth: '700px', height: '80vh' }}
        onHide={() => setShowPatientViewModal(false)}
        modal
      >
        <PatientView onClose={() => setShowPatientViewModal(false)} />
      </Dialog>
    </div>
  );
}