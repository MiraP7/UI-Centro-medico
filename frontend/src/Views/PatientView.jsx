import React, { useState, useEffect } from 'react';
import PatientRegistrationForm from '/src/components/PatientRegistrationForm';
import AppointmentModal from '../components/AppointmentModal.jsx';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

// Asegúrate de que los estilos de PrimeReact (básicos y PrimeFlex) estén disponibles
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

    // Función para manejar paciente registrado, similar a FacturacionView
    const handlePatientRegistered = (newPatient) => {
        console.log('Paciente Registrado (desde PatientView):', newPatient);
        // Cierra el modal de registro
        setShowPatientRegistrationModal(false);
        // Recarga la lista de pacientes para que el nuevo aparezca
        fetchPatients();
    };

    const renderActionButtons = (patient) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-calendar-plus"
                    className="p-button-sm p-button-info"
                    tooltip="Agendar Cita"
                    tooltipOptions={{ position: 'bottom' }}
                    onClick={() => handleOpenAppointmentModal(patient)}
                />
            </div>
        );
    };

    return (
        <div className="p-4">
            <div className="flex justify-content-between align-items-center mb-4">
                {/* Botón: Registrar Paciente - usa el nuevo estado */}
                <Button
                    label="Registrar Paciente"
                    icon="pi pi-user-plus"
                    className="p-button-primary" // O p-button-success p-button-raised como en facturación
                    onClick={() => setShowPatientRegistrationModal(true)} // Abre el Dialog
                />
            </div>

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
                                {/* <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Acciones</th> */}
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
                                    {/* <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{renderActionButtons(patient)}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DIALOG: Para el formulario de registro de paciente, similar a FacturacionView */}
            <Dialog
                header="Registrar Paciente"
                visible={showPatientRegistrationModal} // Controlado por el nuevo estado
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => setShowPatientRegistrationModal(false)} // Cierra el dialog al hacer clic fuera o en la 'x'
                modal // Asegura que sea un modal y bloquee la interacción con el fondo
            >
                {/* Asumiendo que PatientModal ahora es tu formulario de registro, le pasamos las props necesarias */}
                <PatientRegistrationForm // Si PatientModal.jsx es el formulario, mantenlo así. Si es el Dialog, revisa su contenido.
                    onPatientRegistered={handlePatientRegistered}
                    onCancel={() => setShowPatientRegistrationModal(false)} // Prop para que el formulario pueda cerrar el dialog
                />
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