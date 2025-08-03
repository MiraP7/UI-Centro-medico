import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PanelMenu } from 'primereact/panelmenu';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { SplitButton } from 'primereact/splitbutton';
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
import CitaService from '/src/Services/CitaService';

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
  const [editingAppointment, setEditingAppointment] = useState(null); // Para editar citas

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showPatientViewModal, setShowPatientViewModal] = useState(false);
  const [showFacturacionViewModal, setShowFacturacionViewModal] = useState(false);
  const [showAseguradoraViewModal, setShowAseguradoraViewModal] = useState(false);
  const [showMedicoViewModal, setShowMedicoViewModal] = useState(false);

  const toast = useRef(null);


  // AÑADIDO: useEffect para cargar las citas de la API
  useEffect(() => {
    fetchAppointments();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

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

  const handlePatientRegistered = (newPatient) => {
    console.log('Paciente Registrado:', newPatient);
    setShowPatientModal(false);
  };

  const handleAppointmentRegistered = async (appointmentData) => {
    try {
      console.log('📥 === DATOS RECIBIDOS EN DASHBOARD ===');
      console.log('📊 appointmentData completo:', appointmentData);
      console.log('🔍 appointmentData.isEditMode:', appointmentData.isEditMode);

      if (appointmentData.isEditMode) {
        // **MODO EDICIÓN**: Usar PUT con formato de cédulas
        console.log('🔄 === PROCESANDO EDICIÓN CON PUT ===');

        const { citaId, isEditMode, patientName, medicoName, date, time, ...dataForAPI } = appointmentData;

        console.log('🆔 citaId para URL:', citaId);
        console.log('📤 Datos para PUT (solo campos de API):', dataForAPI);

        await citaService.updateCita(citaId, dataForAPI);
        showToast('success', 'Éxito', 'Cita actualizada exitosamente');
      } else {
        // **MODO CREACIÓN**: Usar POST con formato de IDs
        console.log('🆕 === PROCESANDO CREACIÓN CON POST ===');

        // Para POST, NO separar el citaId - enviarlo en el body completo
        console.log('📤 Datos para POST (appointmentData completo):', appointmentData);
        await citaService.createCita(appointmentData);
        showToast('success', 'Éxito', 'Cita registrada exitosamente');
      }

      setShowAppointmentModal(false);
      setEditingAppointment(null);
      // Recargar citas después de la operación
      fetchAppointments();
    } catch (error) {
      console.error('❌ Error al procesar la cita:', error);
      showToast('error', 'Error', 'Hubo un problema al procesar la cita');
    }
  };

  // Funciones para el CRUD de citas
  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleViewAppointment = (appointment) => {
    const detalles = `
🆔 ID: ${appointment.citaId}
👤 Paciente: ${appointment.patient}
👨‍⚕️ Médico: ${appointment.medicoNombre}
📅 Fecha: ${appointment.date}
🕐 Hora: ${appointment.time}
📝 Motivo: ${appointment.motivoConsulta}
📊 Estado: ${appointment.estadoDescripcion}
    `.trim();

    showToast('info', 'Detalles de la Cita', detalles);
  };

  const handleDeleteAppointment = (appointment) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar la cita de ${appointment.patient}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteAppointment(appointment),
      reject: () => console.log('Eliminación cancelada'),
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-text'
    });
  };

  const deleteAppointment = async (appointment) => {
    try {
      // Por ahora mostrar mensaje ya que el endpoint no existe
      showToast('info', 'Información', 'Funcionalidad de eliminación no disponible aún');
      console.log('Eliminando cita:', appointment.citaId);
    } catch (error) {
      showToast('error', 'Error', `Error al eliminar cita: ${error.message}`);
    }
  };

  const handleChangeStatus = async (appointment, nuevoEstadoId) => {
    try {
      setLoadingAppointments(true);
      const appointmentActualizada = {
        ...appointment,
        estadoId: nuevoEstadoId
      };

      await citaService.updateCita(appointment.citaId, appointmentActualizada);
      showToast('success', 'Estado Actualizado', 'El estado de la cita ha sido cambiado');
      await fetchAppointments();
    } catch (error) {
      showToast('error', 'Error', `Error al cambiar estado: ${error.message}`);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const showToast = (severity, summary, detail) => {
    if (toast.current) {
      toast.current.show({ severity, summary, detail });
    }
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

  // Template para los botones de acción
  const actionTemplate = (rowData) => {
    const estadoMenuItems = [
      {
        label: 'Marcar como Completado',
        icon: 'pi pi-check',
        command: () => handleChangeStatus(rowData, 103)
      },
      {
        label: 'Marcar como Cancelado',
        icon: 'pi pi-times',
        command: () => handleChangeStatus(rowData, 104)
      },
      {
        label: 'Marcar como Aprobado',
        icon: 'pi pi-thumbs-up',
        command: () => handleChangeStatus(rowData, 105)
      },
      {
        label: 'Marcar como Pendiente',
        icon: 'pi pi-clock',
        command: () => handleChangeStatus(rowData, 102)
      }
    ];

    return (
      <div className="flex gap-1 align-items-center">
        {/* Botón Ver */}
        {/* <Button
          icon="pi pi-eye"
          size="small"
          severity="info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleViewAppointment(rowData)}
        /> */}

        {/* Botón Editar */}
        <Button
          icon="pi pi-pencil"
          size="small"
          severity="warning"
          tooltip="Editar cita"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleEditAppointment(rowData)}
        />

        {/* Botón Cambiar Estado */}
        {/* <SplitButton
          icon="pi pi-cog"
          size="small"
          severity="secondary"
          tooltip="Cambiar estado"
          tooltipOptions={{ position: 'top' }}
          model={estadoMenuItems}
          onClick={() => console.log('Estado actual:', rowData.estadoDescripcion)}
        /> */}

        {/* Botón Eliminar
        <Button
          icon="pi pi-trash"
          size="small"
          severity="danger"
          tooltip="Eliminar cita"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleDeleteAppointment(rowData)}
        /> */}
      </div>
    );
  };


  return (
    <div className="">
      <Toast ref={toast} />
      <ConfirmDialog />

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
            <Button
              label="Registrar Cita"
              icon="pi pi-calendar-plus"
              className="p-button-info p-button-raised p-2"
              onClick={handleCreateAppointment}
            />
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
                stripedRows
                showGridlines
              >
                <Column field="date" header="Fecha"></Column>
                <Column field="time" header="Hora"></Column>
                <Column field="patient" header="Paciente"></Column>
                <Column field="medicoNombre" header="Médico"></Column>
                <Column field="motivoConsulta" header="Motivo"></Column>
                <Column field="estadoDescripcion" header="Estado"></Column>
                <Column
                  header="Accion"
                  body={actionTemplate}
                  style={{ width: '200px', minWidth: '200px' }}
                  frozen
                  alignFrozen="right"
                />
              </DataTable>
            )}
          </div>
        </div>
      </div>

      {/* Dialog para Registrar/Editar Cita */}
      <Dialog
        header={editingAppointment ? "Editar Cita" : "Registrar Cita"}
        visible={showAppointmentModal}
        style={{ width: '50vw', minWidth: '350px' }}
        onHide={() => {
          setShowAppointmentModal(false);
          setEditingAppointment(null);
        }}
        modal
      >
        <AppointmentRegistrationForm
          appointmentToEdit={editingAppointment}
          onAppointmentRegistered={handleAppointmentRegistered}
          onCancel={() => {
            setShowAppointmentModal(false);
            setEditingAppointment(null);
          }}
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