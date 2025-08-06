import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function SolicitudView() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [errorSolicitudes, setErrorSolicitudes] = useState(null);

    // Estados para filtros de búsqueda
    const [searchSolicitudId, setSearchSolicitudId] = useState('');
    const [searchDescripcion, setSearchDescripcion] = useState('');
    const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);

    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showDetalleDialog, setShowDetalleDialog] = useState(false);

    // Efecto para cargar las solicitudes al inicio
    useEffect(() => {
        const fetchSolicitudes = async () => {
            setLoadingSolicitudes(true);
            setErrorSolicitudes(null);
            try {
                const response = await fetch('https://localhost:7256/api/Solicitud/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result && Array.isArray(result.data)) {
                        setSolicitudes(result.data);
                        console.log("Solicitudes cargadas:", result.data);
                    } else {
                        setErrorSolicitudes("Error al cargar solicitudes. Formato inesperado.");
                        console.error("Formato inesperado de solicitudes:", result);
                        setSolicitudes([]);
                    }
                } else {
                    const errorData = await response.json();
                    setErrorSolicitudes(errorData.message || 'Error al cargar solicitudes.');
                    console.error('Error al cargar solicitudes:', response.status, errorData);
                }
            } catch (error) {
                setErrorSolicitudes('No se pudo conectar para cargar solicitudes.');
                console.error('Error de red al cargar solicitudes:', error);
            } finally {
                setLoadingSolicitudes(false);
            }
        };
        fetchSolicitudes();
    }, []);

    // Efecto para filtrar solicitudes cuando cambian los términos de búsqueda
    useEffect(() => {
        if (!solicitudes || solicitudes.length === 0) {
            setFilteredSolicitudes([]);
            return;
        }

        let filtered = solicitudes;

        // Filtrar por ID de solicitud
        if (searchSolicitudId) {
            filtered = filtered.filter(solicitud =>
                solicitud.solicitudId?.toString().includes(searchSolicitudId)
            );
        }

        // Filtrar por descripción
        if (searchDescripcion) {
            filtered = filtered.filter(solicitud =>
                solicitud.descripcion?.toLowerCase().includes(searchDescripcion.toLowerCase())
            );
        }

        setFilteredSolicitudes(filtered);
    }, [solicitudes, searchSolicitudId, searchDescripcion]);

    const hideDetalleDialog = () => {
        setShowDetalleDialog(false);
        setSelectedSolicitud(null);
    };

    const showSolicitudDetails = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setShowDetalleDialog(true);
    };

    // Template para mostrar el estado sin colores
    const estadoBodyTemplate = (rowData) => {
        return rowData.estado || 'N/A';
    };

    // Template para mostrar el monto aprobado
    const montoAprobadoBodyTemplate = (rowData) => {
        return `$${rowData.montoAprobado?.toFixed(2) || '0.00'}`;
    };

    // Template para botón de acciones
    const actionBodyTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-eye"
                className="p-button-rounded p-button-text p-button-sm"
                tooltip="Ver Detalles"
                tooltipOptions={{ position: 'bottom' }}
                onClick={(e) => {
                    e.stopPropagation();
                    showSolicitudDetails(rowData);
                }}
            />
        );
    };

    const clearFilters = () => {
        setSearchSolicitudId('');
        setSearchDescripcion('');
    };

    return (
        <div className="p-4">
            {/* Título de la página */}
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">Gestión de Autorizaciones</h1>
                <p className="text-600 text-lg">Administra las solicitudes de autorización de tratamientos y procedimientos</p>
            </div>

            <div className="flex justify-content-between align-items-center mb-4">
                <div className="flex gap-2">
                    <Button
                        label="Actualizar"
                        icon="pi pi-refresh"
                        className="p-button-info p-button-raised"
                        onClick={() => window.location.reload()}
                    />
                </div>
            </div>

            {/* Card de filtros de búsqueda */}
            <Card title="Buscar Solicitudes" className="mb-4">
                <div className="grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="searchSolicitudId">ID Solicitud</label>
                        <InputText
                            id="searchSolicitudId"
                            value={searchSolicitudId}
                            onChange={(e) => setSearchSolicitudId(e.target.value)}
                            placeholder="Buscar por ID de solicitud..."
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="searchDescripcion">Descripción</label>
                        <InputText
                            id="searchDescripcion"
                            value={searchDescripcion}
                            onChange={(e) => setSearchDescripcion(e.target.value)}
                            placeholder="Buscar por descripción..."
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4 flex align-items-end">
                        <Button
                            label="Limpiar Filtros"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={clearFilters}
                            disabled={!searchSolicitudId && !searchDescripcion}
                        />
                    </div>
                </div>

                {/* Mostrar información de resultados */}
                {(searchSolicitudId || searchDescripcion) && (
                    <div className="mt-3">
                        <small className="text-600">
                            Mostrando {filteredSolicitudes.length} de {solicitudes.length} solicitudes
                            {searchSolicitudId && ` | ID: "${searchSolicitudId}"`}
                            {searchDescripcion && ` | Descripción: "${searchDescripcion}"`}
                        </small>
                    </div>
                )}
            </Card>

            {loadingSolicitudes && (
                <div className="flex justify-content-center flex-column align-items-center p-5">
                    <ProgressSpinner />
                    <p className="mt-3">Cargando solicitudes...</p>
                </div>
            )}

            {errorSolicitudes && (
                <Message severity="error" summary="Error" text={errorSolicitudes} className="mb-3 w-full" />
            )}

            {!loadingSolicitudes && !errorSolicitudes && solicitudes.length === 0 && (
                <Message severity="info" summary="Información" text="No hay solicitudes registradas." className="mb-3 w-full" />
            )}

            {!loadingSolicitudes && !errorSolicitudes && solicitudes.length > 0 && filteredSolicitudes.length === 0 && (searchSolicitudId || searchDescripcion) && (
                <Message severity="warn" summary="Sin resultados" text="No se encontraron solicitudes que coincidan con los criterios de búsqueda." className="mb-3 w-full" />
            )}

            {!loadingSolicitudes && !errorSolicitudes && filteredSolicitudes.length > 0 && (
                <div className="card">
                    <DataTable
                        value={filteredSolicitudes}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} solicitudes"
                        selectionMode="single"
                        selection={selectedSolicitud}
                        onSelectionChange={(e) => setSelectedSolicitud(e.value)}
                        emptyMessage="No hay solicitudes."
                    >
                        <Column field="solicitudId" header="ID Solicitud" sortable></Column>
                        <Column field="descripcion" header="Descripción" sortable></Column>
                        <Column field="estado" header="Estado" body={estadoBodyTemplate} sortable></Column>
                        <Column field="montoAprobado" header="Monto Aprobado" body={montoAprobadoBodyTemplate} sortable></Column>
                        <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                    </DataTable>
                </div>
            )}

            {/* Dialog para mostrar detalles de solicitud */}
            <Dialog
                header={selectedSolicitud ? `Detalle de Solicitud #${selectedSolicitud.solicitudId}` : "Detalle de Solicitud"}
                visible={showDetalleDialog}
                style={{ width: '70vw', minWidth: '500px' }}
                modal
                onHide={hideDetalleDialog}
            >
                {selectedSolicitud && (
                    <div className="grid">
                        <div className="col-12">
                            <Card title="Información General" className="mb-3">
                                <div className="grid">
                                    <div className="field col-12 md:col-6">
                                        <label><strong>ID Solicitud:</strong></label>
                                        <p>{selectedSolicitud.solicitudId}</p>
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label><strong>Estado:</strong></label>
                                        <p>{selectedSolicitud.estado || 'N/A'}</p>
                                    </div>
                                    <div className="field col-12">
                                        <label><strong>Descripción:</strong></label>
                                        <p>{selectedSolicitud.descripcion}</p>
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label><strong>Tipo de Solicitud:</strong></label>
                                        <p>{selectedSolicitud.tipoSolicitud}</p>
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label><strong>Aseguradora:</strong></label>
                                        <p>{selectedSolicitud.aseguradora || 'N/A'}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-12">
                            <Card title="Información Financiera" className="mb-3">
                                <div className="grid">
                                    <div className="field col-12 md:col-6">
                                        <label><strong>Monto Total:</strong></label>
                                        <p>${selectedSolicitud.montoTotal?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label><strong>Monto Aprobado:</strong></label>
                                        <p className={selectedSolicitud.montoAprobado > 0 ? 'text-green-600 font-bold' : 'text-red-600'}>
                                            ${selectedSolicitud.montoAprobado?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-12">
                            <Card title="Información del Paciente" className="mb-3">
                                <div className="grid">
                                    <div className="field col-12 md:col-6">
                                        <label><strong>Cédula:</strong></label>
                                        <p>{selectedSolicitud.cedula || 'N/A'}</p>
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label><strong>Póliza ID:</strong></label>
                                        <p>{selectedSolicitud.polizaId || 'N/A'}</p>
                                    </div>
                                    <div className="field col-12">
                                        <label><strong>Observaciones:</strong></label>
                                        <p>{selectedSolicitud.observaciones || 'Sin observaciones'}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
