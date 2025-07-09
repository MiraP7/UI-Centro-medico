import React, { useState, useEffect } from 'react';
import PatientRegistrationForm from '/src/components/PatientRegistrationForm';
import AppointmentModal from '../components/AppointmentModal.jsx';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function PatientView({ onClose }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPatientRegistrationModal, setShowPatientRegistrationModal] = useState(false);
    const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [showEditPatientModal, setShowEditPatientModal] = useState(false);

    const handleOpenAppointmentModal = (patient) => {
        setSelectedPatient(patient);
        setAppointmentModalOpen(true);
    };

    const fetchPatients = async () => {
        setLoading(true);
        setError(null);
        console.log("Intentando cargar pacientes de la API...");
        try {
            const response = await fetch('https://localhost:44388/api/Paciente/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
            });

            console.log("Respuesta recibida:", response);

            if (response.ok) {
                const result = await response.json();
                console.log("Datos recibidos de la API (estructura completa):", result);

                if (result && Array.isArray(result.data)) {
                    setPatients(result.data);
                    console.log("Pacientes asignados al estado:", result.data);
                } else {
                    setError("Formato de datos inesperado de la API. No se encontró el array de pacientes en 'data'.");
                    console.error("Formato inesperado:", result);
                    setPatients([]);
                }

            } else {
                const errorData = await response.json();
                const errorMessage = `Error al cargar pacientes: ${errorData.message || 'Error desconocido del servidor.'}`;
                setError(errorMessage);
                console.error('Error de API (respuesta no OK):', response.status, errorData);
            }
        } catch (err) {
            const networkError = `No se pudo conectar al servidor. Verifique su conexión o la URL de la API.`;
            setError(networkError);
            console.error('Error de red o de petición (catch):', err);
        } finally {
            setLoading(false);
            console.log("Estado de carga finalizado.");
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // Función para manejar paciente registrado
    const handlePatientRegistered = (newPatient) => {
        console.log('Paciente Registrado (desde PatientView):', newPatient);
        setShowPatientRegistrationModal(false);
        fetchPatients(); 
    };

    // Función para manejar paciente editado (ahora es idéntica a handlePatientRegistered en su efecto)
    const handlePatientEdited = (updatedPatient) => {
        console.log('Paciente Editado (desde PatientView):', updatedPatient);
        setShowEditPatientModal(false);
        setEditingPatient(null);
        fetchPatients(); 
    };

    // Función para abrir el modal de edición
    const handleEditPatient = (patient) => {
        setEditingPatient(patient); 
        setShowEditPatientModal(true);
    };

    const renderActionButtons = (patient) => {
        return (
            <div className="flex flex-wrap gap-2">
                {/* <Button
                    icon="pi pi-calendar-plus"
                    className="p-button-sm p-button-info"
                    tooltip="Agendar Cita"
                    tooltipOptions={{ position: 'bottom' }}
                    onClick={() => handleOpenAppointmentModal(patient)}
                /> */}
                <Button
                    icon="pi pi-pencil"
                    className="p-button-sm p-button-warning" 
                    tooltip="Editar Paciente"
                    tooltipOptions={{ position: 'bottom' }}
                    onClick={() => handleEditPatient(patient)} 
                />
                
            </div>
        );
    };

    const [apiMessage, setApiMessage] = useState(null); 

    return (
        <div className="p-4">
            
            <div className="flex justify-content-between align-items-center mb-4">
               
                <Button
                    label="Registrar Paciente"
                    icon="pi pi-user-plus"
                    className="p-button-primary"
                    onClick={() => setShowPatientRegistrationModal(true)}
                />
            </div>

            {apiMessage && (
                <div className="col-12 mb-3">
                    <Message severity={apiMessage.severity} summary={apiMessage.summary} text={apiMessage.detail} />
                </div>
            )}

            {loading && (
                <div className="flex justify-content-center flex-column align-items-center p-5">
                    <ProgressSpinner />
                    <p className="mt-3">Cargando pacientes...</p>
                </div>
            )}

            {error && (
                <Message severity="error" summary="Error" text={error} className="mb-3 w-full" />
            )}

            {!loading && !error && patients.length === 0 && (
                <Message severity="info" summary="Información" text="No hay pacientes registrados." className="mb-3 w-full" />
            )}

            {!loading && !error && patients.length > 0 && (
                <div className="card">
                    <table className="p-datatable p-component p-datatable-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead className="p-datatable-thead">
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>ID</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Nombre</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Fecha Nac.</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Sexo</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Teléfono</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Aseguradora</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Póliza ID</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="p-datatable-tbody">
                            {patients.map(patient => (
                                <tr key={patient.pacienteId}>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{patient.pacienteId}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{patient.nombre}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{patient.fechaNacimiento}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{patient.sexo}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{patient.telefono}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{patient.email}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{patient.aseguradora}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{patient.polizaId}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{renderActionButtons(patient)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DIALOG: Para el formulario de registro de paciente */}
            <Dialog
                header="Registrar Paciente"
                visible={showPatientRegistrationModal}
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => setShowPatientRegistrationModal(false)}
                modal
            >
                <PatientRegistrationForm
                    onPatientRegistered={handlePatientRegistered}
                    onCancel={() => setShowPatientRegistrationModal(false)}
                />
            </Dialog>

            {/* DIALOG: Para el formulario de edición de paciente */}
            <Dialog
                header="Editar Paciente"
                visible={showEditPatientModal}
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => { setShowEditPatientModal(false); setEditingPatient(null); }}
                modal
            >
                {editingPatient && (
                    <PatientRegistrationForm
                        initialData={editingPatient}
                        onPatientRegistered={handlePatientEdited}
                        onCancel={() => { setShowEditPatientModal(false); setEditingPatient(null); }}
                    />
                )}
            </Dialog>

            {isAppointmentModalOpen && (
                <AppointmentModal patient={selectedPatient} onClose={() => setAppointmentModalOpen(false)} />
            )}

            {onClose && (
                <div className="flex justify-content-end mt-4">
                    <Button label="Cerrar Vista" icon="pi pi-times" className="p-button-secondary" onClick={onClose} />
                </div>
            )}
        </div>
    );
}