import React, { useState, useEffect } from 'react';
import AseguradoraService from '/src/services/AseguradoraService'; // Import the AseguradoraService

// Importa componentes de PrimeReact para mensajes y spinners
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button'; // Keeping Button for the close action if onClose prop is used

// Asegúrate de que los estilos de PrimeReact estén disponibles
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // O tu tema preferido
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// Instantiate the service
const aseguradoraService = new AseguradoraService();

export default function AseguradoraView({ onClose }) { // Assuming onClose is a prop to close the view
    const [aseguradoras, setAseguradoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch all aseguradoras
    const fetchAseguradoras = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await aseguradoraService.getAllAseguradoras();
            // Assuming the API returns an array directly, not nested in a 'data' property
            setAseguradoras(data);
            console.log("Aseguradoras cargadas:", data);
        } catch (err) {
            setError(err.message);
            console.error("Error al cargar aseguradoras:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchAseguradoras();
    }, []);

    // This function will now return null as there are no actions for display-only view
    const renderActionButtons = (aseguradora) => {
        return null; // No action buttons needed for a display-only view
    };

    return (
        <div className="p-4">
            <div className="flex justify-content-between align-items-center mb-4">
                <h2>Listado de Aseguradoras</h2>
                {/* No 'Registrar Aseguradora' button for a display-only view */}
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
                                {/* Removed 'Acciones' column as there are no actions */}
                            </tr>
                        </thead>
                        <tbody className="p-datatable-tbody">
                            {aseguradoras.map(aseg => (
                                <tr key={aseg.id}> {/* Assuming 'id' is the unique identifier */}
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e9ecef' }}>{aseg.id}</td>
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