import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppointmentRegistrationForm from '../components/AppointmentRegistrationForm';
import FacturacionRegistrationForm from '../components/FacturacionRegistrationForm';
import CitaService from '../Services/CitaService';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';

// Definición de los colores para facilitar la referencia
const COLOR_AZUL_MARINO = '#2c3e50';
const COLOR_AZUL_CLARO = '#3498db';
const COLOR_BLANCO = '#ffffff';

const citaService = new CitaService(); // Instancia del servicio de citas

export default function HomePage() {
    const { isAdmin, canAccessAdminModules, user } = useAuth();
    const navigate = useNavigate();
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [errorAppointments, setErrorAppointments] = useState(null);
    const [editingAppointment, setEditingAppointment] = useState(null);

    const toast = useRef(null);

    // Log para debugging
    useEffect(() => {
        console.log('HomePage - Usuario actual:', user);
        console.log('HomePage - ¿Es admin?', isAdmin());
        console.log('HomePage - RolId:', user?.rolId);
    }, [user, isAdmin]);

    // Cargar las citas al inicio
    useEffect(() => {
        fetchAppointments();
    }, []);

    // Filtrar las citas según el término de búsqueda
    useEffect(() => {
        if (!globalFilter.trim()) {
            setFilteredAppointments(appointments);
        } else {
            const filtered = appointments.filter(appointment => {
                const searchTerm = globalFilter.toLowerCase();
                const matchesDate = appointment.date?.toLowerCase().includes(searchTerm);
                const matchesTime = appointment.time?.toLowerCase().includes(searchTerm);
                const matchesPatient = appointment.patient?.toLowerCase().includes(searchTerm);
                const matchesMedico = appointment.medicoNombre?.toLowerCase().includes(searchTerm);
                const matchesMotivo = appointment.motivoConsulta?.toLowerCase().includes(searchTerm);
                const matchesEstado = appointment.estadoDescripcion?.toLowerCase().includes(searchTerm);
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
            setFilteredAppointments(data);
        } catch (err) {
            setErrorAppointments(`Error al cargar citas: ${err.message}`);
            console.error("Error fetching appointments:", err);
        } finally {
            setLoadingAppointments(false);
        }
    };

    const handleAppointmentRegistered = async (appointmentData) => {
        try {
            console.log('📥 === DATOS RECIBIDOS EN HOME ===');
            console.log('📊 appointmentData completo:', appointmentData);

            if (appointmentData.isEditMode) {
                console.log('🔄 === PROCESANDO EDICIÓN CON PUT ===');
                const { citaId, isEditMode, patientName, medicoName, date, time, ...dataForAPI } = appointmentData;
                console.log('🆔 citaId para URL:', citaId);
                console.log('📤 Datos para PUT:', dataForAPI);
                await citaService.updateCita(citaId, dataForAPI);
                showToast('success', 'Éxito', 'Cita actualizada exitosamente');
            } else {
                console.log('🆕 === PROCESANDO CREACIÓN CON POST ===');
                console.log('📤 Datos para POST:', appointmentData);
                await citaService.createCita(appointmentData);
                showToast('success', 'Éxito', 'Cita registrada exitosamente');
            }

            setShowAppointmentModal(false);
            setEditingAppointment(null);
            fetchAppointments();
        } catch (error) {
            console.error('❌ Error al procesar la cita:', error);
            showToast('error', 'Error', 'Hubo un problema al procesar la cita');
        }
    };

    const handleCreateAppointment = () => {
        setEditingAppointment(null);
        setShowAppointmentModal(true);
    };

    const handleBillingRegistered = (newBilling) => {
        console.log('Factura registrada:', newBilling);
        setShowBillingModal(false);
        showToast('success', 'Éxito', 'Factura registrada exitosamente');
    };

    const handleEditAppointment = (appointment) => {
        setEditingAppointment(appointment);
        setShowAppointmentModal(true);
    };

    const showToast = (severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // Template para los botones de acción
    const actionTemplate = (rowData) => {
        return (
            <div className="flex gap-1 align-items-center">
                <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="warning"
                    tooltip="Editar cita"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleEditAppointment(rowData)}
                />
            </div>
        );
    };

    return (
        <div className="">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="grid m-0">
                <div className="container-citas col-12">
                    <div className="grid">
                        {/* Columna izquierda - Tabla de Citas */}
                        <div className="col-9">
                            <div className="card p-2 shadow-1 border-round-md">
                                <h2 className="text-xl font-bold mb-3" style={{ color: COLOR_AZUL_CLARO, textAlign: 'center' }}>
                                    Citas Programadas
                                </h2>

                                {/* Barra de búsqueda */}
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-search" style={{ color: COLOR_AZUL_MARINO }}></i>
                                        <InputText
                                            value={globalFilter}
                                            onChange={(e) => setGlobalFilter(e.target.value)}
                                            placeholder="Buscar citas..."
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
                                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                                        <p className="mt-3">Cargando citas...</p>
                                    </div>
                                ) : errorAppointments ? (
                                    <Message severity="error" summary="Error" text={errorAppointments} className="mb-3 w-full" />
                                ) : filteredAppointments.length === 0 && appointments.length === 0 ? (
                                    <Message severity="info" summary="Información" text="No hay citas programadas." className="mb-3 w-full" />
                                ) : filteredAppointments.length === 0 && globalFilter ? (
                                    <Message severity="warn" summary="Sin resultados" text="No se encontraron citas que coincidan con la búsqueda." className="mb-3 w-full" />
                                ) : (
                                    <DataTable
                                        value={filteredAppointments}
                                        responsiveLayout="scroll"
                                        emptyMessage="No hay citas programadas."
                                        paginator
                                        rows={5}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} citas"
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
                                            header="Acciones"
                                            body={actionTemplate}
                                            style={{ width: '100px', minWidth: '100px' }}
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
                                <div className='flex flex-column gap-2'>
                                    <Button
                                        label="Registrar Cita"
                                        icon="pi pi-calendar-plus"
                                        className="p-button-info p-button-raised p-1 w-full text-sm"
                                        onClick={handleCreateAppointment}
                                    />

                                    {/* Solo mostrar botón de facturación para administradores */}
                                    {user?.rolId === 100 && (
                                        <Button
                                            label="Facturación"
                                            icon="pi pi-money-bill"
                                            className="p-button-success p-button-raised p-1 w-full text-sm"
                                            onClick={() => setShowBillingModal(true)}
                                        />
                                    )}

                                    <Button
                                        label="Autorización"
                                        icon="pi pi-check-square"
                                        className="p-button-warning p-button-raised p-1 w-full text-sm"
                                        onClick={() => navigate('/autorizacion')}
                                    />
                                </div>
                            </div>
                        </div>
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

            {/* Dialog para Registrar Factura - Solo para administradores */}
            {user?.rolId === 100 && (
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
            )}
        </div>
    );
}
