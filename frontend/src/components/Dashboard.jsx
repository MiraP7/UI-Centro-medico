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
import '/src/App.css'; // Asegúrate de tener tu archivo CSS global
import PatientView from '/src/Views/PatientView';
import FacturacionView from '/src/Views/FacturacionView';
import AseguradoraView from '/src/Views/AseguradoraView';
import MedicoView from '/src/Views/MedicoView';

// AÑADIDO: Importa el nuevo servicio de Citas
import CitaService from '/src/services/CitaService';

// Las citas iniciales hardcodeadas ya no son necesarias
// const initialAppointments = [...];

// Definición de los colores para facilitar la referencia
const COLOR_AZUL_MARINO = '#2c3e50';
const COLOR_AZUL_CLARO = '#3498db';
const COLOR_BLANCO = '#ffffff';

const citaService = new CitaService(); // Instancia del servicio de citas

export default function Dashboard({ onLogout }) {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointments, setAppointments] = useState([]); // Ahora se inicializa vacío
  const [loadingAppointments, setLoadingAppointments] = useState(true); // Nuevo estado de carga
  const [errorAppointments, setErrorAppointments] = useState(null); // Nuevo estado de error

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showPatientViewModal, setShowPatientViewModal] = useState(false);
  const [showFacturacionViewModal, setShowFacturacionViewModal] = useState(false);
  const [showAseguradoraViewModal, setShowAseguradoraViewModal] = useState(false);
  const [showMedicoViewModal, setShowMedicoViewModal] = useState(false);


  // AÑADIDO: useEffect para cargar las citas de la API
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      setErrorAppointments(null);
      try {
        const data = await citaService.getAllCitas();
        setAppointments(data);
      } catch (err) {
        setErrorAppointments(`Error al cargar citas: ${err.message}`);
        console.error("Error fetching appointments:", err);
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchAppointments();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  const handlePatientRegistered = (newPatient) => {
    console.log('Paciente Registrado:', newPatient);
    setShowPatientModal(false);
  };

  const handleAppointmentRegistered = (newAppointment) => {
    console.log('Cita Registrada:', newAppointment);
    // Después de registrar una nueva cita, recargar la lista desde la API
    // Si tu AppointmentRegistrationForm ya llama a la API para crear la cita,
    // solo necesitas volver a llamar fetchAppointments() aquí.
    // Para este ejemplo, simulo la adición local si no hay API real.
    // setAppointments(prev => [...prev, { ...newAppointment, id: Date.now(), patient: newAppointment.patientName || 'Nuevo Paciente' }]);
    setShowAppointmentModal(false);
    // Recargar citas después de que una nueva sea registrada
    fetchAppointments();
  };

  // Función auxiliar para cerrar todos los modales de vista
  const closeAllViewModals = () => {
    setShowPatientViewModal(false);
    setShowFacturacionViewModal(false);
    setShowAseguradoraViewModal(false);
    setShowMedicoViewModal(false);
    setSidebarVisible(false);
  };

  // Definición de los ítems del PanelMenu
  const items = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home', // Eliminado 'icons-bar' de aquí
      command: () => {
        closeAllViewModals(); // Usa la función general para cerrar modales
      },
    },
    {
      label: 'Pacientes',
      icon: 'pi pi-fw pi-users', // Eliminado 'icons-bar' de aquí
      command: () => {
        closeAllViewModals();
        setShowPatientViewModal(true);
      },
    },
    {
      label: 'Facturación',
      icon: 'pi pi-fw pi-money-bill', // Eliminado 'icons-bar' de aquí
      command: () => {
        closeAllViewModals();
        setShowFacturacionViewModal(true);
      },
    },
    {
      label: 'Autorización',
      icon: 'pi pi-fw pi-check-square', // Eliminado 'icons-bar' de aquí
      command: () => {
        closeAllViewModals();
        // Lógica para Autorización
      }
    },
    {
      label: 'Medicos',
      icon: 'pi pi-fw pi-user-md', // Eliminado 'icons-bar' de aquí
      command: () => {
        closeAllViewModals();
        setShowMedicoViewModal(true); // Abre el modal de Médicos
      }
    },
    {
      label: 'Usuarios',
      icon: 'pi pi-fw pi-id-card', // Eliminado 'icons-bar' de aquí
      command: () => {
        closeAllViewModals();
        // Lógica para Usuarios
      }
    },
    {
      label: 'Aseguradora ',
      icon: 'pi pi-fw pi-shield', // Eliminado 'icons-bar' de aquí
      command: () => {
        closeAllViewModals();
        setShowAseguradoraViewModal(true);
      }
    }
  ];

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Asegúrate de que la fecha sea válida antes de formatear
    if (isNaN(date.getTime())) {
      return 'Fecha Inválida';
    }
    return date.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha Inválida';
    }
    return date.toLocaleDateString('es-DO') + ' ' + date.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className="">
      {/* Sidebar para el PanelMenu */}
      <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)}
        showCloseIcon={true}
        baseZIndex={9999}
        className="w-20rem icons-bar" // APLICA LA CLASE icons-bar AQUÍ
      // style={{ backgroundColor: '#273747ff' }} // Puedes eliminar esto si icons-bar ya lo define
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

          </div>
          <div className="card p-2 shadow-1 border-round-md">
            <h2 className="text-xl font-bold mb-3" style={{ color: COLOR_AZUL_CLARO, textAlign: 'center' }}>Citas</h2>

            {loadingAppointments ? (
              <div className="flex justify-content-center flex-column align-items-center p-5">
                {/* <ProgressSpinner /> */}
                <p className="mt-3">Cargando citas...</p>
              </div>
            ) : errorAppointments ? (
              <Message severity="error" summary="Error" text={errorAppointments} className="mb-3 w-full" />
            ) : appointments.length === 0 ? (
              <Message severity="info" summary="Información" text="No hay citas programadas." className="mb-3 w-full" />
            ) : (
              <DataTable value={appointments} responsiveLayout="scroll" emptyMessage="No hay citas programadas para hoy."
                paginator
                rows={9}
                className=''
                rowsPerPageOptions={[5, 10, 25, 50]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} citas "
              >
                <Column field="date" header="Fecha"></Column> {/* Nueva columna para la fecha */}
                <Column field="time" header="Hora"></Column>
                <Column field="patient" header="Paciente"></Column>
                <Column field="medicoNombre" header="Médico"></Column> {/* Nueva columna para el médico */}
                <Column field="motivoConsulta" header="Motivo"></Column>
                <Column field="estadoDescripcion" header="Estado"></Column> {/* Nueva columna para el estado */}
              </DataTable>
            )}
          </div>
        </div>
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
        style={{ width: '90vw', minWidth: '900px', height: '90vh' }}
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
        header="Gestión de Médicos"
        visible={showMedicoViewModal}
        style={{ width: '80vw', minWidth: '700px', height: '80vh' }}
        onHide={() => setShowMedicoViewModal(false)}
        modal
      >
        <MedicoView onClose={() => setShowMedicoViewModal(false)} />
      </Dialog>

    </div>
  );
}