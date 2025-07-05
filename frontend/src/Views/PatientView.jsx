import React, { useState, useEffect } from 'react';
import PatientModal from '../components/patient/PatientModal.jsx';
import AppointmentModal from '../components/appointment/AppointmentModal.jsx';
// Importa componentes de PrimeReact para mensajes y spinners (ya que no usaremos DataTable)
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';

// Asegúrate de que los estilos de PrimeReact (básicos y PrimeFlex) estén disponibles
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'; // Para utilidades de layout (flexbox, spacing, etc.)

export default function PatientView({ onClose }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isPatientModalOpen, setPatientModalOpen] = useState(false);
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
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
            });

            console.log("Respuesta recibida:", response);

            if (response.ok) {
                const result = await response.json(); // Cambié 'data' a 'result' para evitar confusión
                console.log("Datos recibidos de la API (estructura completa):", result); // Mostrar la estructura completa

                // *** ¡LA CLAVE ESTÁ AQUÍ! ***
                // Tu API devuelve un objeto con una propiedad 'data' que contiene el array de pacientes.
                // Accede a 'result.data' para obtener el array.
                if (result && Array.isArray(result.data)) {
                    setPatients(result.data); // Asigna el array de pacientes a tu estado
                    console.log("Pacientes asignados al estado:", result.data); // Confirma que se asigna el array
                } else {
                    setError("Formato de datos inesperado de la API. No se encontró el array de pacientes en 'data'.");
                    console.error("Formato inesperado:", result);
                    setPatients([]); // Asegura que 'patients' sea un array vacío
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

    const handlePatientRegistered = (newPatient) => {
        console.log('Paciente Registrado desde el modal:', newPatient);
        setPatientModalOpen(false);
        fetchPatients(); // Recargar la lista para incluir el nuevo paciente
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
                <h2>Gestión de Pacientes</h2>
                <Button
                    label="Registrar Paciente"
                    icon="pi pi-user-plus"
                    className="p-button-primary"
                    onClick={() => setPatientModalOpen(true)}
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

            {isPatientModalOpen && (
                <PatientModal
                    onClose={() => setPatientModalOpen(false)}
                    onPatientRegistered={handlePatientRegistered}
                />
            )}
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