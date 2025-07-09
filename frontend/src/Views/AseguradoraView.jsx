import React, { useState, useEffect } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function AseguradoraView({ onClose }) {
    const [aseguradoras, setAseguradoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para cargar todas las aseguradoras (AHORA CON PETICIÓN DIRECTA)
    const fetchAseguradoras = async () => {
        setLoading(true);
        setError(null);
        setAseguradoras([]); 
        console.log("Intentando cargar aseguradoras de la API directamente...");
        try {
            const response = await fetch('https://localhost:44388/api/Aseguradora/all', {
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

    useEffect(() => {
        fetchAseguradoras();
    }, []); 

    const renderActionButtons = (aseguradora) => {
        return null; 
    };

    return (
        <div className="p-4">
            <div className="flex justify-content-between align-items-center mb-4">
    
            </div>

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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {onClose && (
                <div className="flex justify-content-end mt-4">
                    <Button label="Cerrar Vista" icon="pi pi-times" className="p-button-secondary" onClick={onClose} />
                </div>
            )}
        </div>
    );
}