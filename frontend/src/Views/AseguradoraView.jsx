import React, { useState, useEffect } from 'react';

// YA NO NECESITAMOS IMPORTAR AseguradoraService AQUÍ
// import AseguradoraService from '/src/services/AseguradoraService'; 

// Importa componentes de PrimeReact
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
// YA NO NECESITAMOS Dialog AQUÍ
// import { Dialog } from 'primereact/dialog'; 

// YA NO NECESITAMOS IMPORTAR EL COMPONENTE AseguradoraRegistrationForm AQUÍ
// import AseguradoraRegistrationForm from '/src/components/AseguradoraRegistrationForm'; 

// Asegúrate de que los estilos de PrimeReact estén disponibles
import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function AseguradoraView({ onClose }) {
    const [aseguradoras, setAseguradoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // YA NO NECESITAMOS apiMessage AQUÍ si no hay acciones que lo generen
    // const [apiMessage, setApiMessage] = useState(null); 

    // YA NO NECESITAMOS ESTADOS PARA LOS MODALES DE REGISTRO Y EDICIÓN
    // const [showAseguradoraRegistrationModal, setShowAseguradoraRegistrationModal] = useState(false);
    // const [editingAseguradora, setEditingAseguradora] = useState(null); 
    // const [showEditAseguradoraModal, setShowEditAseguradoraModal] = useState(false);

    // Función para cargar todas las aseguradoras (AHORA CON PETICIÓN DIRECTA)
    const fetchAseguradoras = async () => {
        setLoading(true);
        setError(null);
        setAseguradoras([]); 
        // setApiMessage(null); // No necesario si no hay apiMessage
        console.log("Intentando cargar aseguradoras de la API directamente...");
        try {
            const response = await fetch('https://localhost:44388/api/Aseguradora/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Descomentar si se necesita autenticación
                },
            });

            console.log("Respuesta recibida:", response);

            if (response.ok) {
                const result = await response.json();
                console.log("Datos recibidos de la API (estructura completa):", result);

                // Lógica para manejar si la API devuelve el array directamente o dentro de una propiedad 'data'
                if (result && Array.isArray(result.data)) {
                    setAseguradoras(result.data);
                    console.log("Aseguradoras asignadas al estado:", result.data);
                } else if (Array.isArray(result)) {
                    setAseguradoras(result);
                    console.log("Aseguradoras asignadas al estado (directamente):", result);
                }
                 else {
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

    // Efecto para cargar aseguradoras al montar el componente
    useEffect(() => {
        fetchAseguradoras();
    }, []); 

    // YA NO NECESITAMOS ESTAS FUNCIONES YA QUE NO HAY FORMULARIOS NI EDICIÓN
    // const handleAseguradoraRegistered = (newAseguradora) => { /* ... */ };
    // const handleAseguradoraEdited = (updatedAseguradora) => { /* ... */ };
    // const handleEditAseguradora = (aseguradora) => { /* ... */ };

    // Función para renderizar los botones de acción por fila
    // Ahora devuelve null porque no hay acciones en esta vista de solo lectura
    const renderActionButtons = (aseguradora) => {
        return null; 
    };

    return (
        <div className="p-4">
            <div className="flex justify-content-between align-items-center mb-4">
                {/* YA NO HAY BOTÓN DE "REGISTRAR ASEGURADORA" */}
                {/* <Button
                    label="Registrar Aseguradora"
                    icon="pi pi-building" 
                    className="p-button-primary"
                    onClick={() => setShowAseguradoraRegistrationModal(true)}
                /> */}
            </div>

            {/* YA NO MOSTRAMOS apiMessage SI NO SE GENERAN ACCIONES */}
            {/* {apiMessage && (
                <div className="col-12 mb-3">
                    <Message severity={apiMessage.severity} summary={apiMessage.summary} text={apiMessage.detail} />
                </div>
            )} */}

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

            {!loading && !error && aseguradoras.length > 0 && (
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
                                {/* YA NO HAY COLUMNA DE ACCIONES */}
                                {/* <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Acciones</th> */}
                            </tr>
                        </thead>
                        <tbody className="p-datatable-tbody">
                            {aseguradoras.map(aseg => (
                                <tr key={aseg.aseguradoraId || aseg.id}> 
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.aseguradoraId || aseg.id}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.nombre}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.direccion}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.telefono}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.email}</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.contacto}</td>
                                    {/* YA NO HAY CELDA DE ACCIONES */}
                                    {/* <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{renderActionButtons(aseg)}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* YA NO HAY DIALOGS DE REGISTRO NI EDICIÓN */}
            {/* <Dialog
                header="Registrar Aseguradora"
                visible={showAseguradoraRegistrationModal}
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => setShowAseguradoraRegistrationModal(false)}
                modal
            >
                <AseguradoraRegistrationForm
                    onAseguradoraRegistered={handleAseguradoraRegistered}
                    onCancel={() => setShowAseguradoraRegistrationModal(false)}
                />
            </Dialog> */}

            {/* <Dialog
                header="Editar Aseguradora"
                visible={showEditAseguradoraModal}
                style={{ width: '50vw', minWidth: '350px' }}
                onHide={() => { setShowEditAseguradoraModal(false); setEditingAseguradora(null); }}
                modal
            >
                {editingAseguradora && ( 
                    <AseguradoraRegistrationForm
                        initialData={editingAseguradora} 
                        onAseguradoraRegistered={handleAseguradoraEdited} 
                        onCancel={() => { setShowEditAseguradoraModal(false); setEditingAseguradora(null); }}
                    />
                )}
            </Dialog> */}

            {onClose && (
                <div className="flex justify-content-end mt-4">
                    <Button label="Cerrar Vista" icon="pi pi-times" className="p-button-secondary" onClick={onClose} />
                </div>
            )}
        </div>
    );
}