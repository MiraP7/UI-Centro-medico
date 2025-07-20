import React, { useState, useEffect } from 'react';
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
import FacturacionView from '/src/Views/FacturacionView';
import AseguradoraView from '/src/Views/AseguradoraView';
// AÑADIDO: Importa MedicoView
import MedicoView from '/src/Views/MedicoView'; // Asegúrate de que esta ruta sea correcta

const initialAppointments = [
  { id: 1, time: '09:00 AM', patient: 'Juan Pérez', reason: 'Consulta General' },
  { id: 2, time: '10:30 AM', patient: 'Ana Gómez', reason: 'Revisión Dental' },
  { id: 3, time: '11:00 AM', patient: 'Pedro López', reason: 'Vacunación' },
  { id: 4, time: '11:30 AM', patient: 'María Fernández', reason: 'Examen de la vista' },
  { id: 5, time: '12:00 PM', patient: 'Carlos Ruiz', reason: 'Control de rutina' },
  { id: 6, time: '01:00 PM', patient: 'Laura Díaz', reason: 'Terapia física' },
  { id: 7, time: '01:30 PM', patient: 'Roberto Soto', reason: 'Consulta dermatológica' },
  { id: 8, time: '02:00 PM', patient: 'Sofía Castro', reason: 'Seguimiento' },
  { id: 9, time: '02:30 PM', patient: 'Miguel Torres', reason: 'Endocrinología' },
  { id: 10, time: '03:00 PM', patient: 'Elena Vargas', reason: 'Ecografía' },
  { id: 11, time: '03:30 PM', patient: 'Gabriel Ramos', reason: 'Rehabilitación' },
  { id: 12, time: '04:00 PM', patient: 'Daniela Morales', reason: 'Chequeo pediátrico' },
];

// Definición de los colores para facilitar la referencia
const COLOR_AZUL_MARINO = '#2c3e50';
const COLOR_AZUL_CLARO = '#3498db';
const COLOR_BLANCO = '#ffffff';

export default function Dashboard({ onLogout }) {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showPatientViewModal, setShowPatientViewModal] = useState(false);
  const [showFacturacionViewModal, setShowFacturacionViewModal] = useState(false);
  const [showAseguradoraViewModal, setShowAseguradoraViewModal] = useState(false);
  // AÑADIDO: Nuevo estado para controlar la visibilidad del modal de Médicos
  const [showMedicoViewModal, setShowMedicoViewModal] = useState(false);


  const handlePatientRegistered = (newPatient) => {
    console.log('Paciente Registrado:', newPatient);
    setShowPatientModal(false);
  };

  const handleAppointmentRegistered = (newAppointment) => {
    console.log('Cita Registrada:', newAppointment);
    setAppointments(prev => [...prev, { ...newAppointment, id: Date.now(), patient: newAppointment.patientName || 'Nuevo Paciente' }]);
    setShowAppointmentModal(false);
  };

  // Función auxiliar para cerrar todos los modales de vista
  const closeAllViewModals = () => {
    setShowPatientViewModal(false);
    setShowFacturacionViewModal(false);
    setShowAseguradoraViewModal(false);
    setShowMedicoViewModal(false); // AÑADIDO: Cierra el modal de médicos
    setSidebarVisible(false);
  };

  // Definición de los ítems del PanelMenu
  const items = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      command: () => {
        closeAllViewModals();
      },
    },
    {
      label: 'Pacientes',
      icon: 'pi pi-fw pi-users',
      command: () => {
        closeAllViewModals();
        setShowPatientViewModal(true);

      },
    },
    {
      label: 'Facturación',
      icon: 'pi pi-fw pi-money-bill',
      command: () => {
        closeAllViewModals();
        setShowFacturacionViewModal(true);

      },
    },
    {
      label: 'Autorización',
      icon: 'pi pi-fw pi-check-square',
      command: () => {
        closeAllViewModals();
      }
    },
    {
      label: 'Medicos',
      icon: 'pi pi-fw pi-user-md',
      // AÑADIDO: Comando para mostrar el modal de Médicos
      command: () => {
        closeAllViewModals(); // Cierra todos los modales antes de abrir el de médicos
        setShowMedicoViewModal(true); // Establece el estado para mostrar el modal de médicos
      }
    },
    {
      label: 'Usuarios',
      icon: 'pi pi-fw pi-id-card',
      command: () => {
        closeAllViewModals();
      }
    },
    {
      label: 'Aseguradora',
      icon: 'pi pi-fw pi-shield',
      command: () => {
        closeAllViewModals();
        setShowAseguradoraViewModal(true);
      }
    }
  ];

  return (
    <div className="">
      {/* Sidebar para el PanelMenu */}
      <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)}
        showCloseIcon={true}
        baseZIndex={9999}
        className="w-20rem"
        style={{ backgroundColor: COLOR_AZUL_MARINO }}
      >
        <h3 className="mb-3 pl-3 text-2xl font-semibold" style={{ color: COLOR_BLANCO, textAlign: 'center' }}>Menú Principal</h3>
        <PanelMenu model={items} className="w-full sidebar-panelmenu" />
      </Sidebar>

      {/* HEADER */}
      <header style={{ backgroundColor: COLOR_AZUL_MARINO }}
        className="flex align-items-center justify-content-between p-3 shadow-2 mb-4">
        <div className="flex align-items-center gap-3">
          <Button icon="pi pi-bars" className="p-button-text p-button-plain p-button-lg" style={{ color: COLOR_BLANCO }} onClick={() => setSidebarVisible(true)} />
          <i className="pi pi-heart-fill" style={{ color: COLOR_AZUL_CLARO, fontSize: '2.5rem' }}></i>
          <h1 className="text-4xl font-bold m-0" style={{ color: COLOR_BLANCO }}>Health State</h1>
        </div>
        <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-danger p-button-sm" onClick={onLogout} />
      </header>

      <div className="grid m-4">
        <div className="container-citas col-12 ">
          <div className='bnt-registrar'>
            <Button label="Registrar Cita" icon="pi pi-calendar-plus" className="p-button-info p-button-raised p-2" onClick={() => setShowAppointmentModal(true)} />

          </div>          <div className="card p-2 shadow-1 border-round-md">
            <h2 className="text-xl font-bold mb-3" style={{ color: COLOR_AZUL_CLARO, textAlign: 'center' }}>Citas del Día</h2>
            <DataTable value={appointments} responsiveLayout="scroll" emptyMessage="No hay citas programadas para hoy."
              paginator
              rows={9}
              className=''
              rowsPerPageOptions={[5, 10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} citas "
            >
              <Column field="time" header="Hora"></Column>
              <Column field="patient" header="Paciente"></Column>
              <Column field="reason" header="Motivo"></Column>
            </DataTable>
          </div>
        </div>
        {/* <div className="col-12 md:col-3 p-2 m-2">
          <div className="card shadow-1 border-round-md">
            <h2 className="text-xl font-semibold mb-4" style={{ textAlign: 'center' }}>Acciones Rápidas</h2>
            <div className="flex flex-column gap-3">
              <Button label="Registrar Paciente" icon="pi pi-user-plus" className="p-button-success p-button-raised p-button-sm" onClick={() => setShowPatientModal(true)} /> 
              <Button label="Registrar Cita" icon="pi pi-calendar-plus" className="p-button-info p-button-raised " onClick={() => setShowAppointmentModal(true)} />
            </div>
          </div>
        </div> */}
      </div>

      {/* Dialog para Registrar Cita */}
      <Dialog header="Registrar Cita" visible={showAppointmentModal} style={{ width: '50vw', minWidth: '350px' }} onHide={() => setShowAppointmentModal(false)} modal>
        <AppointmentRegistrationForm
          onAppointmentRegistered={handleAppointmentRegistered}
          onCancel={() => setShowAppointmentModal(false)}
        />
      </Dialog>

      {/* Dialog para la Vista de Pacientes (PatientView) */}
      <Dialog
        header="Gestión de Pacientes"
        visible={showPatientViewModal}
        style={{ width: '80vw', minWidth: '700px', height: '80vh' }}
        onHide={() => setShowPatientViewModal(false)}
        modal
      >
        <PatientView onClose={() => setShowPatientViewModal(false)} />
      </Dialog>

      {/* Dialog para la Vista de Facturación (FacturacionView) */}
      <Dialog
        header="Módulo de Facturación"
        visible={showFacturacionViewModal}
        style={{ width: '90vw', minWidth: '800px', height: '90vh' }}
        onHide={() => setShowFacturacionViewModal(false)}
        modal
      >
        <FacturacionView onClose={() => setShowFacturacionViewModal(false)} />
      </Dialog>

      {/* Dialog para la Vista de Aseguradoras (AseguradoraView) */}
      <Dialog
        header="Listado de Aseguradoras"
        visible={showAseguradoraViewModal}
        style={{ width: '70vw', minWidth: '600px', height: '70vh' }}
        onHide={() => setShowAseguradoraViewModal(false)}
        modal
      >
        <AseguradoraView onClose={() => setShowAseguradoraViewModal(false)} />
      </Dialog>

      {/* AÑADIDO: Dialog para la Vista de Médicos (MedicoView) */}
      <Dialog
        header="Gestión de Médicos" // Título para el modal de médicos
        visible={showMedicoViewModal} // Controla la visibilidad con el nuevo estado
        style={{ width: '80vw', minWidth: '700px', height: '80vh' }} // Ajusta el tamaño según necesites
        onHide={() => setShowMedicoViewModal(false)} // Cierra el modal
        modal
      >
        <MedicoView onClose={() => setShowMedicoViewModal(false)} />
      </Dialog>

    </div>
  );
}