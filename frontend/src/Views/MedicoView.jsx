import React, { useState, useEffect, useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'; // Importar ConfirmDialog

// Importamos el formulario para médicos
import MedicoRegistrationForm from '/src/components/MedicoRegistrationForm';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function MedicoView() {
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiMessage, setApiMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para los modales de registro y edición
    const [showMedicoRegistrationModal, setShowMedicoRegistrationModal] = useState(false);
    const [editingMedico, setEditingMedico] = useState(null);
    const [showEditMedicoModal, setShowEditMedicoModal] = useState(false);

    const toast = useRef(null);

    // Función para cargar todos los médicos
    const fetchMedicos = async () => {
        setLoading(true);
        setError(null);
        setMedicos([]);
        setApiMessage(null);
        console.log("Intentando cargar médicos de la API...");
        try {
            const response = await fetch('https://localhost:7256/api/Medico/all', {
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

                // Asume que la API devuelve los datos directamente como un array o en una propiedad 'data'
                if (result && Array.isArray(result.data)) {
                    setMedicos(result.data);
                    console.log("Médicos asignados al estado:", result.data);
                } else if (Array.isArray(result)) {
                    setMedicos(result);
                    console.log("Médicos asignados al estado (directamente):", result);
                } else {
                    setError("Formato de datos inesperado de la API. No se encontró el array de médicos en 'data' o directamente.");
                    console.error("Formato inesperado:", result);
                    setMedicos([]);
                }
            } else {
                const errorData = await response.json();
                const errorMessage = `Error al cargar médicos: ${errorData.message || 'Error desconocido del servidor.'}`;
                setError(errorMessage);
                console.error('Error de API (respuesta no OK):', response.status, errorData);
            }
        } catch (err) {
            const networkError = `No se pudo conectar al servidor. Verifique su conexión o la URL de la API.`;
            setError(networkError);
            console.error('Error de red o de petición (catch):', err);
        } finally {
            setLoading(false);
            console.log("Estado de carga de médicos finalizado.");
        }
    };

    useEffect(() => {
        fetchMedicos();
    }, []);

    // Función para filtrar médicos según el término de búsqueda
    const filteredMedicos = medicos.filter(medico => {
        const searchLower = searchTerm.toLowerCase();

        return (
            medico.cedula?.toString().toLowerCase().includes(searchLower) ||
            medico.nombre?.toLowerCase().includes(searchLower) ||
            medico.especialidad?.toLowerCase().includes(searchLower)
        );
    });

    // Función para manejar el guardado (registro o edición) de un médico
    const handleMedicoSaved = (savedMedico) => {
        console.log('Médico guardado (desde MedicoView):', savedMedico);
        setShowMedicoRegistrationModal(false);
        setShowEditMedicoModal(false);
        setEditingMedico(null);
        fetchMedicos(); // Recarga la lista para reflejar los cambios
    };

    // Función para abrir el modal de edición con los datos del médico seleccionado
    const handleEditMedico = (medico) => {
        setEditingMedico(medico);
        setShowEditMedicoModal(true);
    };

    // Función para manejar la eliminación de un médico
    const handleDeleteMedico = (medicoId) => {
        confirmDialog({
            message: '¿Está seguro de que desea eliminar este médico? Esta acción no se puede deshacer.',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: async () => {
                try {
                    setLoading(true);
                    console.log("Intentando eliminar Médico con ID:", medicoId);
                    const response = await fetch(`https://localhost:7256/api/Medico/${medicoId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                    });

                    console.log("Respuesta de la API de DELETE:", response);
                    console.log("Estado de la respuesta:", response.status);

                    if (response.ok) {
                        if (response.status === 204) { // 204 No Content es común para DELETE exitoso
                            const successMessage = `Médico con ID ${medicoId} eliminado exitosamente.`;
                            toast.current.show({ severity: 'success', summary: 'Eliminado', detail: successMessage, life: 3000 });
                            console.log(successMessage);
                            fetchMedicos();
                        } else {
                            const result = await response.json();
                            const successMessage = result.message || `Médico con ID ${medicoId} eliminado exitosamente.`;
                            toast.current.show({ severity: 'success', summary: 'Eliminado', detail: successMessage, life: 3000 });
                            console.log(successMessage, result);
                            fetchMedicos();
                        }
                    } else {
                        let errorData = {};
                        try {
                            errorData = await response.json();
                        } catch (jsonError) {
                            console.warn("La respuesta de error no es JSON o está vacía:", jsonError);
                            errorData.message = response.statusText || 'Error desconocido del servidor.';
                        }
                        const errorMessage = errorData.message || `Error desconocido al eliminar el médico con ID ${medicoId}. Código de estado: ${response.status}`;
                        toast.current.show({ severity: 'error', summary: 'Error', detail: `Fallo al eliminar: ${errorMessage}`, life: 5000 });
                        console.error('Error al eliminar médico:', response.status, errorData);
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar para eliminar el médico. Verifique su conexión o la URL de la API.', life: 5000 });
                    console.error('Error de red o de petición (catch principal):', error);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // Función para renderizar los botones de acción por fila
    const renderActionButtons = (medico) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-sm p-button-warning"
                    tooltip="Editar Médico"
                    tooltipOptions={{ position: 'bottom' }}
                    onClick={() => handleEditMedico(medico)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-sm p-button-danger"
                    tooltip="Eliminar Médico"
                    tooltipOptions={{ position: 'bottom' }}
                    onClick={() => handleDeleteMedico(medico.medicoId)}
                />
            </div>
        );
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <ConfirmDialog /> {/* ¡Importante! Asegúrate de que ConfirmDialog esté aquí */}

            {/* Título de la página */}
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">Gestión de Médicos</h1>
                <p className="text-600 text-lg">Administra la información de los médicos y especialistas del centro</p>
            </div>

            <div className="flex justify-content-between align-items-center mb-4">
                <div className="flex align-items-center gap-3">
                    <Button
                        label="Registrar Médico"
                        // icon="pi pi-plus"
                        className="p-button-primary"
                        onClick={() => setShowMedicoRegistrationModal(true)}
                    />
                </div>

                <div className="flex align-items-center gap-2">
                    <span className="p-input-icon-left">
                        {/* <i className="pi pi-search" /> */}
                        <InputText
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar..."
                            className="w-20rem"
                        />
                    </span>
                </div>
            </div>

            {apiMessage && (
                <div className="col-12 mb-3">
                    <Message severity={apiMessage.severity} summary={apiMessage.summary} text={apiMessage.detail} />
                </div>
            )}

            {loading && (
                <div className="flex justify-content-center flex-column align-items-center p-5">
                    <ProgressSpinner />
                    <p className="mt-3">Cargando médicos...</p>
                </div>
            )}

            {error && (
                <Message severity="error" summary="Error" text={error} className="mb-3 w-full" />
            )}

            {!loading && !error && medicos.length === 0 && (
                <Message severity="info" summary="Información" text="No hay médicos registrados." className="mb-3 w-full" />
            )}

            {!loading && !error && medicos.length > 0 && filteredMedicos.length === 0 && searchTerm && (
                <Message severity="warn" summary="Sin resultados" text={`No se encontraron médicos que coincidan con "${searchTerm}".`} className="mb-3 w-full" />
            )}

            {!loading && !error && filteredMedicos.length > 0 && (
                <div className="card">
                    <table className="p-datatable p-component p-datatable-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead className="p-datatable-thead">
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Cédula</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Nombre</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Apellido</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Especialidad</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Teléfono</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="p-datatable-tbody">
                            {filteredMedicos.map(med => (
                                <tr key={med.medicoId || med.id}>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{med.cedula}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{med.nombre}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{med.apellido}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{med.especialidad}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{med.telefono}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{med.email}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{renderActionButtons(med)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DIALOG: Para el formulario de registro de médico */}
            <Dialog
                header="Registrar Nuevo Médico"
                visible={showMedicoRegistrationModal}
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => setShowMedicoRegistrationModal(false)}
                modal
            >
                <MedicoRegistrationForm
                    onMedicoSaved={handleMedicoSaved}
                    onCancel={() => setShowMedicoRegistrationModal(false)}
                    initialData={null} // Para registro, no hay datos iniciales
                />
            </Dialog>

            {/* DIALOG: Para el formulario de edición de médico */}
            <Dialog
                header="Editar Médico"
                visible={showEditMedicoModal}
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => { setShowEditMedicoModal(false); setEditingMedico(null); }}
                modal
            >
                {editingMedico && ( // Renderiza el formulario solo si hay un médico para editar
                    <MedicoRegistrationForm
                        initialData={editingMedico} // Pasa los datos del médico a editar
                        onMedicoSaved={handleMedicoSaved}
                        onCancel={() => { setShowEditMedicoModal(false); setEditingMedico(null); }}
                    />
                )}
            </Dialog>

            {/* {onClose && (
                <div className="flex justify-content-end mt-4">
                    <Button label="Cerrar Vista" icon="pi pi-times" className="p-button-secondary" onClick={onClose} />
                </div>
            )} */}
        </div>
    );
}