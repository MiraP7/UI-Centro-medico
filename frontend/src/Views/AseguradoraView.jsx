import React, { useState, useEffect, useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

import AseguradoraRegistrationForm from '/src/components/AseguradoraRegistrationForm';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function AseguradoraView() {
    const [aseguradoras, setAseguradoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiMessage, setApiMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [showAseguradoraRegistrationModal, setShowAseguradoraRegistrationModal] = useState(false);
    const [editingAseguradora, setEditingAseguradora] = useState(null);
    const [showEditAseguradoraModal, setShowEditAseguradoraModal] = useState(false);

    const toast = useRef(null);

    const fetchAseguradoras = async () => {
        setLoading(true);
        setError(null);
        setAseguradoras([]);
        setApiMessage(null);
        console.log("Intentando cargar aseguradoras de la API directamente...");
        try {
            const response = await fetch('https://localhost:7256/api/Aseguradora/all', {
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
                    setAseguradoras(result.data);
                    console.log("Aseguradoras asignadas al estado:", result.data);
                } else if (Array.isArray(result)) {
                    setAseguradoras(result);
                    console.log("Aseguradoras asignadas al estado (directamente):", result);
                } else {
                    setError("Formato de datos inesperado de la API. No se encontró el array de aseguradoras en 'data' o directamente.");
                    console.error("Formato inesperado:", result);
                    setAseguradoras([]);
                }
            } else {
                const errorData = await response.json();
                const errorMessage = `Error al cargar aseguradoras: ${errorData.message || 'Error desconocido del servidor.'}`;
                setError(errorMessage);
                console.error('Error de API (respuesta no OK):', response.status, errorData);
            }
        } catch (err) {
            const networkError = `No se pudo conectar al servidor. Verifique su conexión o la URL de la API.`;
            setError(networkError);
            console.error('Error de red o de petición (catch):', err);
        } finally {
            setLoading(false);
            console.log("Estado de carga de aseguradoras finalizado.");
        }
    };

    useEffect(() => {
        fetchAseguradoras();
    }, []);

    // Función para filtrar aseguradoras según el término de búsqueda
    const filteredAseguradoras = aseguradoras.filter(aseguradora => {
        const searchLower = searchTerm.toLowerCase();

        return (
            aseguradora.aseguradoraId?.toString().toLowerCase().includes(searchLower) ||
            aseguradora.id?.toString().toLowerCase().includes(searchLower) ||
            aseguradora.nombre?.toLowerCase().includes(searchLower)
        );
    });

    const handleAseguradoraSaved = (savedAseguradora) => {
        console.log('Aseguradora guardada (desde AseguradoraView):', savedAseguradora);
        setShowAseguradoraRegistrationModal(false);
        setShowEditAseguradoraModal(false);
        setEditingAseguradora(null);
        fetchAseguradoras();
    };

    const handleEditAseguradora = (aseguradora) => {
        setEditingAseguradora(aseguradora);
        setShowEditAseguradoraModal(true);
    };

    const handleDeleteAseguradora = (aseguradoraId) => {
        confirmDialog({
            message: '¿Está seguro de que desea eliminar esta aseguradora? Esta acción no se puede deshacer.',
            // header: 'Confirmar Eliminación',
            // icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: async () => {
                try {
                    setLoading(true);
                    console.log("Intentando eliminar Aseguradora con ID:", aseguradoraId);
                    const response = await fetch(`https://localhost:7256/api/Aseguradora/${aseguradoraId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                    });

                    console.log("Respuesta de la API de DELETE:", response);
                    console.log("Estado de la respuesta:", response.status);

                    if (response.ok) {
                        // **CAMBIO CRÍTICO AQUÍ:**
                        // Verifica si el status es 204 (No Content) o si no hay cuerpo en la respuesta.
                        if (response.status === 204) {
                            const successMessage = `Aseguradora con ID ${aseguradoraId} eliminada exitosamente.`;
                            toast.current.show({ severity: 'success', summary: 'Eliminado', detail: successMessage, life: 3000 });
                            console.log(successMessage);
                            fetchAseguradoras(); // Recargar la lista
                        } else {
                            // Si hay algún otro status OK (ej. 200) y se espera JSON, parsearlo
                            // Aunque para DELETE, 204 es lo más común y recomendado.
                            const result = await response.json();
                            const successMessage = result.message || `Aseguradora con ID ${aseguradoraId} eliminada exitosamente.`;
                            toast.current.show({ severity: 'success', summary: 'Eliminado', detail: successMessage, life: 3000 });
                            console.log(successMessage, result);
                            fetchAseguradoras();
                        }
                    } else {
                        // Manejo de errores para respuestas no-OK (ej. 400, 401, 404, 500)
                        let errorData = {};
                        try {
                            // Intenta parsear el JSON de error si existe
                            errorData = await response.json();
                        } catch (jsonError) {
                            console.warn("La respuesta de error no es JSON o está vacía:", jsonError);
                            // Si no es JSON, usa el texto de estado de la respuesta
                            errorData.message = response.statusText || 'Error desconocido del servidor.';
                        }
                        const errorMessage = errorData.message || `Error desconocido al eliminar la aseguradora con ID ${aseguradoraId}. Código de estado: ${response.status}`;
                        toast.current.show({ severity: 'error', summary: 'Error', detail: `Fallo al eliminar: ${errorMessage}`, life: 5000 });
                        console.error('Error al eliminar aseguradora:', response.status, errorData);
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar para eliminar la aseguradora. Verifique su conexión o la URL de la API.', life: 5000 });
                    console.error('Error de red o de petición (catch principal):', error);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const renderActionButtons = (aseguradora) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-sm p-button-warning"
                    tooltip="Editar Aseguradora"
                    tooltipOptions={{ position: 'bottom' }}
                    onClick={() => handleEditAseguradora(aseguradora)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-sm p-button-danger"
                    tooltip="Eliminar Aseguradora"
                    tooltipOptions={{ position: 'bottom' }}
                    onClick={() => handleDeleteAseguradora(aseguradora.aseguradoraId)}
                />
            </div>
        );
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Título de la página */}
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">Gestión de Aseguradoras</h1>
                <p className="text-600 text-lg">Administra las compañías de seguros y planes de salud</p>
            </div>

            <div className="flex justify-content-between align-items-center mb-4">
                <div className="flex align-items-center gap-3">
                    <Button
                        label="Registrar Aseguradora"
                        // icon="pi pi-plus"
                        className="p-button-primary"
                        onClick={() => setShowAseguradoraRegistrationModal(true)}
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
                    <p className="mt-3">Cargando aseguradoras...</p>
                </div>
            )}

            {error && (
                <Message severity="error" summary="Error" text={error} className="mb-3 w-full" />
            )}

            {!loading && !error && aseguradoras.length === 0 && (
                <Message severity="info" summary="Información" text="No hay aseguradoras registradas." className="mb-3 w-full" />
            )}

            {!loading && !error && aseguradoras.length > 0 && filteredAseguradoras.length === 0 && searchTerm && (
                <Message severity="warn" summary="Sin resultados" text={`No se encontraron aseguradoras que coincidan con "${searchTerm}".`} className="mb-3 w-full" />
            )}

            {!loading && !error && filteredAseguradoras.length > 0 && (
                <div className="card">
                    <table className="p-datatable p-component p-datatable-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead className="p-datatable-thead">
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>ID</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Nombre</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Dirección</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Teléfono</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Contacto</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="p-datatable-tbody">
                            {filteredAseguradoras.map(aseg => (
                                <tr key={aseg.aseguradoraId || aseg.id}>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.aseguradoraId || aseg.id}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.nombre}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.direccion}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.telefono}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.email}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.contacto}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{renderActionButtons(aseg)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog
                header="Registrar Nueva Aseguradora"
                visible={showAseguradoraRegistrationModal}
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => setShowAseguradoraRegistrationModal(false)}
                modal
            >
                <AseguradoraRegistrationForm
                    onAseguradoraSaved={handleAseguradoraSaved}
                    onCancel={() => setShowAseguradoraRegistrationModal(false)}
                    initialData={null}
                />
            </Dialog>

            <Dialog
                header="Editar Aseguradora"
                visible={showEditAseguradoraModal}
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => { setShowEditAseguradoraModal(false); setEditingAseguradora(null); }}
                modal
            >
                {editingAseguradora && (
                    <AseguradoraRegistrationForm
                        initialData={editingAseguradora}
                        onAseguradoraSaved={handleAseguradoraSaved}
                        onCancel={() => { setShowEditAseguradoraModal(false); setEditingAseguradora(null); }}
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