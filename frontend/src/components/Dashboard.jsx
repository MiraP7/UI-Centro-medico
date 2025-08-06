import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PanelMenu } from 'primereact/panelmenu';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { SplitButton } from 'primereact/splitbutton';
import { InputText } from 'primereact/inputtext';
import AppointmentRegistrationForm from './AppointmentRegistrationForm';
import FacturacionRegistrationForm from './FacturacionRegistrationForm';
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
import UserView from '/src/Views/UserView';
import AuthService from '/src/Services/AuthService';

// AÑADIDO: Importa el nuevo servicio de Citas
import CitaService from '/src/Services/CitaService';

// Las citas iniciales hardcodeadas ya no son necesarias
// const initialAppointments = [...];

const COLOR_AZUL_MARINO = '#2c3e50';
const COLOR_AZUL_CLARO = '#3498db';
const COLOR_BLANCO = '#ffffff';

const citaService = new CitaService(); // Instancia del servicio de citas
const authService = new AuthService(); // Instancia del servicio de autenticación

export default function Dashboard({ onLogout, initialView = 'home' }) {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [appointments, setAppointments] = useState([]); // Ahora se inicializa vacío
  const [filteredAppointments, setFilteredAppointments] = useState([]); // Estado para citas filtradas
  const [globalFilter, setGlobalFilter] = useState(''); // Estado para el filtro global
  const [loadingAppointments, setLoadingAppointments] = useState(true); // Nuevo estado de carga
  const [errorAppointments, setErrorAppointments] = useState(null); // Nuevo estado de error
  const [editingAppointment, setEditingAppointment] = useState(null); // Para editar citas

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentView, setCurrentView] = useState(initialView); // Usar initialView como valor inicial
  
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userRole = authService.getUserRole();

  const toast = useRef(null);


  // AÑADIDO: useEffect para cargar las citas de la API
  useEffect(() => {
    fetchAppointments();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // AÑADIDO: useEffect para filtrar las citas según el término de búsqueda
  useEffect(() => {
    if (!globalFilter.trim()) {
      // Si no hay filtro, mostrar todas las citas
      setFilteredAppointments(appointments);
    } else {
      // Filtrar las citas según el término de búsqueda
      const filtered = appointments.filter(appointment => {
        const searchTerm = globalFilter.toLowerCase();

        // Buscar en múltiples campos
        const matchesDate = appointment.date?.toLowerCase().includes(searchTerm);
        const matchesTime = appointment.time?.toLowerCase().includes(searchTerm);
        const matchesPatient = appointment.patient?.toLowerCase().includes(searchTerm);
        const matchesMedico = appointment.medicoNombre?.toLowerCase().includes(searchTerm);
        const matchesMotivo = appointment.motivoConsulta?.toLowerCase().includes(searchTerm);
        const matchesEstado = appointment.estadoDescripcion?.toLowerCase().includes(searchTerm);

        // También buscar en fechaHora si está disponible
        const matchesFechaHora = appointment.fechaHora?.toLowerCase().includes(searchTerm);

        return matchesDate || matchesTime || matchesPatient || matchesMedico ||
          matchesMotivo || matchesEstado || matchesFechaHora;
      });

      setFilteredAppointments(filtered);
    }
  }, [appointments, globalFilter]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setErrorAppointments(null);
    try {
      const data = await citaService.getAllCitas();
      setAppointments(data);
      setFilteredAppointments(data); // Inicializar filteredAppointments con todos los datos
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

  // Manejador para cuando se registra una factura
  const handleBillingRegistered = (newBilling) => {
    console.log('Factura registrada:', newBilling);
    setShowBillingModal(false);
    showToast('success', 'Éxito', 'Factura registrada exitosamente');
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
    setShowBillingModal(false);
    setSidebarVisible(false);
  };

  // Función para cambiar la vista actual usando React Router
  const navigateToView = (viewName) => {
    const routeMap = {
      'home': '/',
      'patients': '/pacientes',
      'billing': '/facturacion',
      'authorization': '/autorizacion',
      'medicos': '/medicos',
      'users': '/usuarios',
      'aseguradoras': '/aseguradoras'
    };
    
    const route = routeMap[viewName] || '/';
    navigate(route);
    setSidebarVisible(false);
  };

  // Función para renderizar el contenido según la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'patients':
        return (
          <div className="col-12">
            <div className="flex justify-content-center">
              <div className="w-full max-w-screen-xl">
                <PatientView onClose={() => navigateToView('home')} />
              </div>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="col-12">
            <div className="flex justify-content-center">
              <div className="w-full max-w-screen-xl">
                <FacturacionView onClose={() => navigateToView('home')} />
              </div>
            </div>
          </div>
        );
      case 'aseguradoras':
        return (
          <div className="col-12">
            <div className="flex justify-content-center">
              <div className="w-full max-w-screen-xl">
                <AseguradoraView onClose={() => navigateToView('home')} />
              </div>
            </div>
          </div>
        );
      case 'medicos':
        return (
          <div className="col-12">
            <div className="flex justify-content-center">
              <div className="w-full max-w-screen-xl">
                <MedicoView onClose={() => navigateToView('home')} />
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="col-12">
            <div className="flex justify-content-center">
              <div className="w-full max-w-screen-xl">
                <UserView onClose={() => navigateToView('home')} />
              </div>
            </div>
          </div>
        );
      case 'authorization':
        return (
          <div className="col-12">
            <div className="flex justify-content-center">
              <div className="w-full max-w-screen-xl">
                <div className="card p-4 shadow-1 border-round-md">
                  <h2 className="text-xl font-bold mb-3" style={{ color: COLOR_AZUL_CLARO, textAlign: 'center' }}>
                    Módulo de Autorización
                  </h2>
                  <p className="text-center text-500">
                    Esta funcionalidad estará disponible próximamente.
                  </p>
                  <div className="flex justify-content-center mt-3">
                    <Button 
                      label="Volver al Home" 
                      icon="pi pi-arrow-left" 
                      onClick={() => navigateToView('home')}
                      className="p-button-outlined"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="col-12">
            <div className="flex justify-content-center">
              <div className="w-full max-w-screen-xl">
                <div className="container-citas">
                  <div className="grid">
                    {/* Columna izquierda - Tabla de Citas */}
                    <div className="col-9">
                      <div className="card p-2 shadow-1 border-round-md">
                        <h2 className="text-xl font-bold mb-3" style={{ color: COLOR_AZUL_CLARO, textAlign: 'center' }}>Citas</h2>

                        {/* Barra de búsqueda */}
                        <div className="flex justify-content-between align-items-center mb-3">
                          <div className="flex align-items-center gap-2">
                            <i className="pi pi-search" style={{ color: COLOR_AZUL_MARINO }}></i>
                            <InputText
                              value={globalFilter}
                              onChange={(e) => setGlobalFilter(e.target.value)}
                              placeholder="Buscar..."
                              className="w-full"
                              style={{ minWidth: '300px' }}
                            />
                            {globalFilter && (
                              <Button
                                icon="pi pi-times"
                                className="p-button-text p-button-sm"
                                onClick={() => setGlobalFilter('')}
                                tooltip="Limpiar búsqueda"
                                tooltipOptions={{ position: 'top' }}
                              />
                            )}
                          </div>
                          {globalFilter && (
                            <small className="text-500">
                              {filteredAppointments.length} de {appointments.length} citas
                            </small>
                          )}
                        </div>

                        {loadingAppointments ? (
                          <div className="flex justify-content-center flex-column align-items-center p-5">
                            {/* <ProgressSpinner /> */}
                            <p className="mt-3">Cargando citas...</p>
                          </div>
                        ) : errorAppointments ? (
                          <Message severity="error" summary="Error" text={errorAppointments} className="mb-3 w-full" />
                        ) : filteredAppointments.length === 0 && appointments.length === 0 ? (
                          <Message severity="info" summary="Información" text="No hay citas programadas." className="mb-3 w-full" />
                        ) : filteredAppointments.length === 0 && globalFilter ? (
                          <Message severity="warn" summary="Sin resultados" text="No se encontraron citas que coincidan con la búsqueda." className="mb-3 w-full" />
                        ) : (
                          <DataTable value={filteredAppointments} responsiveLayout="scroll" emptyMessage="No hay citas programadas para hoy."
                            paginator
                            rows={3}
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

                    {/* Columna derecha - Acciones Rápidas */}
                    <div className="col-3">
                      <div className="card p-2 shadow-1 border-round-md">
                        <h4 className="text-base font-semibold mb-2" style={{ color: COLOR_AZUL_MARINO, textAlign: 'center' }}>
                          <i className="pi pi-bolt mr-1"></i>
                          Acciones Rápidas
                        </h4>
                        <div className='bnt-registrar flex flex-column gap-2'>
                          <Button
                            label="Registrar Cita"
                            icon="pi pi-calendar-plus"
                            className="p-button-info p-button-raised p-1 w-full text-sm"
                            onClick={handleCreateAppointment}
                          />
                          <Button
                            label="Facturación"
                            icon="pi pi-money-bill"
                            className="p-button-success p-button-raised p-1 w-full text-sm"
                            onClick={() => {
                              closeAllViewModals();
                              setShowBillingModal(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Definición de los ítems del PanelMenu basado en roles
  const getAllowedMenuItems = () => {
    const allItems = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        command: () => navigateToView('home'),
      },
      {
        label: 'Pacientes',
        icon: 'pi pi-fw pi-users',
        command: () => navigateToView('patients'),
      },
      {
        label: 'Facturación',
        icon: 'pi pi-fw pi-money-bill',
        command: () => navigateToView('billing'),
      },
      {
        label: 'Autorización',
        icon: 'pi pi-fw pi-check-square',
        command: () => navigateToView('authorization'),
      },
      {
        label: 'Médicos',
        icon: 'pi pi-fw pi-user-md',
        command: () => navigateToView('medicos'),
        adminOnly: true
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-fw pi-id-card',
        command: () => navigateToView('users'),
        adminOnly: true
      },
      {
        label: 'Aseguradoras',
        icon: 'pi pi-fw pi-shield',
        command: () => navigateToView('aseguradoras'),
        adminOnly: true
      }
    ];

    // Filtrar elementos según el rol
    if (userRole === 'admin') {
      return allItems; // Admin ve todo
    } else if (userRole === 'operador') {
      return allItems.filter(item => !item.adminOnly); // Operador solo ve elementos sin adminOnly
    }
    
    return []; // Sin rol, sin acceso
  };

  const items = getAllowedMenuItems();

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
    <div className="dashboard-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Sidebar para el PanelMenu */}
      <Sidebar 
        visible={sidebarVisible} 
        onHide={() => setSidebarVisible(false)}
        showCloseIcon={true}
        baseZIndex={9999}
        className="w-20rem icons-bar"
        modal={true} // Esto añade el overlay oscuro automáticamente
        blockScroll={true} // Evita el scroll cuando el sidebar está abierto
      >
        <h3 className="mb-3 pl-3 text-2xl font-semibold" style={{ color: COLOR_BLANCO, textAlign: 'center' }}>
          Menú Principal
        </h3>
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
        
        <div className="flex align-items-center gap-3">
          {/* Información del usuario */}
          <div className="flex flex-column align-items-end">
            <span className="text-white text-sm font-semibold">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
            <span className="text-blue-200 text-xs">
              {userRole === 'admin' ? 'Administrador' : 'Operador'}
            </span>
          </div>
          
          <Button 
            label="Cerrar Sesión" 
            icon="pi pi-sign-out" 
            className="p-button-danger p-button-sm" 
            onClick={() => {
              authService.logout();
              if (onLogout) onLogout();
              navigate('/login');
            }} 
          />
        </div>
      </header>

      {/* Contenido principal */}
      <div 
        className="main-content"
        style={{ 
          padding: '1rem',
          minHeight: 'calc(100vh - 120px)',
          width: '100%'
        }}
      >
        {renderCurrentView()}
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

      {/* Dialog para Registrar Factura */}
      <Dialog
        header="Registrar Factura"
        visible={showBillingModal}
        style={{ width: '70vw', minWidth: '600px' }}
        onHide={() => setShowBillingModal(false)}
        modal
      >
        <FacturacionRegistrationForm
          onFacturaRegistered={handleBillingRegistered}
          onCancel={() => setShowBillingModal(false)}
        />
      </Dialog>

    </div>
  );
}