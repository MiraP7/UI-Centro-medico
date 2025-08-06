import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import FacturaService from '/src/services/FacturaService';
import PatientRegistrationForm from '/src/components/PatientRegistrationForm';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const facturaService = new FacturaService();

export default function FacturacionView() {
    const [facturas, setFacturas] = useState([]);
    const [loadingFacturas, setLoadingFacturas] = useState(true);
    const [errorFacturas, setErrorFacturas] = useState(null);

    // Estados para filtros de búsqueda
    const [searchFacturaId, setSearchFacturaId] = useState('');
    const [searchPaciente, setSearchPaciente] = useState('');
    const [filteredFacturas, setFilteredFacturas] = useState([]);

    const [selectedFactura, setSelectedFactura] = useState(null); // Estado para la factura seleccionada
    const [detalleFactura, setDetalleFactura] = useState([]);
    const [showDetalleDialog, setShowDetalleDialog] = useState(false);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState(null);
    const [showPatientRegistrationModal, setShowPatientRegistrationModal] = useState(false);
    const [loadingReporte, setLoadingReporte] = useState(false);

    // Efecto para cargar las facturas al inicio
    useEffect(() => {
        const fetchFacturas = async () => {
            setLoadingFacturas(true);
            setErrorFacturas(null);
            try {
                const data = await facturaService.getAllFacturas();
                setFacturas(data);
            } catch (err) {
                setErrorFacturas(`Error al cargar facturas: ${err.message}`);
                console.error("Error fetching facturas:", err);
            } finally {
                setLoadingFacturas(false);
            }
        };
        fetchFacturas();
    }, []);

    // Efecto para filtrar facturas cuando cambian los términos de búsqueda
    useEffect(() => {
        if (!facturas || facturas.length === 0) {
            setFilteredFacturas([]);
            return;
        }

        let filtered = facturas;

        // Filtrar por ID de factura
        if (searchFacturaId) {
            filtered = filtered.filter(factura =>
                factura.facturaId?.toString().includes(searchFacturaId)
            );
        }

        // Filtrar por nombre de paciente
        if (searchPaciente) {
            filtered = filtered.filter(factura =>
                factura.pacienteNombre?.toLowerCase().includes(searchPaciente.toLowerCase())
            );
        }

        setFilteredFacturas(filtered);
    }, [facturas, searchFacturaId, searchPaciente]);

    // Nuevo efecto para cargar los detalles cuando selectedFactura cambia
    useEffect(() => {
        if (selectedFactura) {
            // Solo cargar detalles si hay una factura seleccionada y no se está cargando ya
            const fetchDetalle = async () => {
                setLoadingDetalle(true);
                setErrorDetalle(null);
                setShowDetalleDialog(true); // Abrir el diálogo inmediatamente
                try {
                    const detalles = await facturaService.getDetalleFacturaByFacturaId(selectedFactura.facturaId);
                    setDetalleFactura(detalles);
                } catch (err) {
                    setErrorDetalle(`Error al cargar detalles: ${err.message}`);
                    console.error("Error fetching factura details:", err);
                    setDetalleFactura([]);
                } finally {
                    setLoadingDetalle(false);
                }
            };
            fetchDetalle();
        } else {
            // Si selectedFactura es null, cerrar el diálogo y limpiar
            setShowDetalleDialog(false);
            setDetalleFactura([]);
            setErrorDetalle(null);
        }
    }, [selectedFactura]); // Este efecto se ejecuta cada vez que selectedFactura cambia

    const hideDetalleDialog = () => {
        setShowDetalleDialog(false);
        setSelectedFactura(null); // Limpiar la factura seleccionada al cerrar el diálogo
        setDetalleFactura([]);
        setErrorDetalle(null);
    };

    const handlePatientRegistered = () => {
        console.log("Paciente registrado desde la vista de facturación.");
        setShowPatientRegistrationModal(false);

    };

    const pagadoBodyTemplate = (rowData) => {
        return (
            <i className={rowData.pagado ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                style={{ color: rowData.pagado ? 'green' : 'red', fontSize: '1.2rem' }}>
            </i>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-search"
                className="p-button-rounded p-button-text p-button-sm"
                tooltip="Ver Detalles"
                tooltipOptions={{ position: 'bottom' }}
                onClick={(e) => {
                    // Prevenir que el evento de clic en el botón active también la selección de la fila
                    e.stopPropagation();
                    setSelectedFactura(rowData); // Establecer la factura seleccionada y el useEffect la manejará
                }}
            />
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const montoCubiertoBodyTemplate = (rowData) => {
        if (rowData.cubierto !== undefined && rowData.cubierto !== null) {
            if (rowData.cubierto > 0) {
                return (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>
                        ${rowData.cubierto.toFixed(2)}
                    </span>
                );
            } else {
                return (
                    <span style={{ color: 'red' }}>
                        ${rowData.cubierto.toFixed(2)}
                    </span>
                );
            }
        }
        return '';
    };

    const handleReporteCoberturaClick = async () => {
        console.log("Generando reporte de cobertura...");
        setLoadingReporte(true);

        try {
            // Paso 1: Obtener todas las facturas
            console.log("📥 Obteniendo todas las facturas...");
            const todasLasFacturas = await facturaService.getAllFacturas();

            if (!todasLasFacturas || todasLasFacturas.length === 0) {
                console.warn("⚠️ No hay facturas disponibles para procesar");
                alert("No hay facturas disponibles para generar el reporte de cobertura.");
                return;
            }

            // Paso 2: Formatear las facturas para el request
            const bills = todasLasFacturas.map(factura => ({
                authorizationNumber: factura.facturaId,
                amount: factura.monto
            }));

            console.log("📋 Facturas formateadas para envío:", bills);

            // Paso 3: Preparar el payload para la API
            const payload = {
                bills: bills,
                hospital: "HealthState"
            };

            console.log("📤 Payload completo:", payload);

            // Paso 4: Realizar la petición a la API de pago
            const response = await fetch('https://localhost:7256/api/ars/pay-bill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                console.log("✅ Respuesta exitosa del reporte de cobertura:", result);

                // Mostrar información del resultado
                const totalFacturas = result.bills ? result.bills.length : 0;
                const resumenInfo = `
Reporte de Cobertura Completado:
• ID de Transferencia: ${result.transferenceId}
• Monto Total: $${result.totalAmount?.toFixed(2) || '0.00'}
• Monto Pagado: $${result.paidAmount?.toFixed(2) || '0.00'}
• Monto Rechazado: $${result.refusedAmount?.toFixed(2) || '0.00'}
• Facturas Procesadas: ${totalFacturas}
                `.trim();

                alert(resumenInfo);

                // Log detallado de cada factura procesada
                if (result.bills && result.bills.length > 0) {
                    console.log("📊 Detalles por factura:");
                    result.bills.forEach(bill => {
                        console.log(`   Autorización: ${bill.authorizationNumber} | Estado: ${bill.status} | Detalles: ${bill.details}`);
                    });
                }
            } else {
                const errorData = await response.json();
                console.error("❌ Error en el reporte de cobertura:", response.status, errorData);
                alert(`Error al generar reporte de cobertura: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("❌ Error de red en reporte de cobertura:", error);
            alert(`Error de conexión al generar reporte de cobertura: ${error.message}`);
        } finally {
            setLoadingReporte(false);
        }
    };

    const clearFilters = () => {
        setSearchFacturaId('');
        setSearchPaciente('');
    };

    return (
        <div className="p-4">
            {/* Título de la página */}
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">Gestión de Facturación</h1>
                <p className="text-600 text-lg">Administra las facturas y procesos de facturación del centro médico</p>
            </div>

            <div className="flex justify-content-between align-items-center mb-4">

                <div className="flex gap-2">

                    {/* <Button
                        label="Registrar Paciente"
                        icon="pi pi-user-plus"
                        className="p-button-success p-button-raised"
                        onClick={() => setShowPatientRegistrationModal(true)}
                    /> */}

                    <Button
                        label={loadingReporte ? "Generando Reporte..." : "Reporte de Cobertura"}
                        icon={loadingReporte ? "pi pi-spin pi-spinner" : "pi pi-file"}
                        className="p-button-info p-button-raised"
                        onClick={handleReporteCoberturaClick}
                        disabled={loadingReporte}
                    />
                </div>
            </div>

            {/* Card de filtros de búsqueda */}
            <Card title="Buscar Facturas" className="mb-4">
                <div className="grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="searchFacturaId">ID Factura</label>
                        <InputText
                            id="searchFacturaId"
                            value={searchFacturaId}
                            onChange={(e) => setSearchFacturaId(e.target.value)}
                            placeholder="Buscar por ID de factura..."
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="searchPaciente">Paciente</label>
                        <InputText
                            id="searchPaciente"
                            value={searchPaciente}
                            onChange={(e) => setSearchPaciente(e.target.value)}
                            placeholder="Buscar por nombre de paciente..."
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4 flex align-items-end">
                        <Button
                            label="Limpiar Filtros"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={clearFilters}
                            disabled={!searchFacturaId && !searchPaciente}
                        />
                    </div>
                </div>

                {/* Mostrar información de resultados */}
                {(searchFacturaId || searchPaciente) && (
                    <div className="mt-3">
                        <small className="text-600">
                            Mostrando {filteredFacturas.length} de {facturas.length} facturas
                            {searchFacturaId && ` | ID: "${searchFacturaId}"`}
                            {searchPaciente && ` | Paciente: "${searchPaciente}"`}
                        </small>
                    </div>
                )}
            </Card>

            {loadingFacturas && (
                <div className="flex justify-content-center flex-column align-items-center p-5">
                    <ProgressSpinner />
                    <p className="mt-3">Cargando facturas...</p>
                </div>
            )}

            {errorFacturas && (
                <Message severity="error" summary="Error" text={errorFacturas} className="mb-3 w-full" />
            )}

            {!loadingFacturas && !errorFacturas && facturas.length === 0 && (
                <Message severity="info" summary="Información" text="No hay facturas registradas." className="mb-3 w-full" />
            )}

            {!loadingFacturas && !errorFacturas && facturas.length > 0 && filteredFacturas.length === 0 && (searchFacturaId || searchPaciente) && (
                <Message severity="warn" summary="Sin resultados" text="No se encontraron facturas que coincidan con los criterios de búsqueda." className="mb-3 w-full" />
            )}

            {!loadingFacturas && !errorFacturas && filteredFacturas.length > 0 && (
                <div className="card">
                    <DataTable value={filteredFacturas} paginator rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} facturas"
                        selectionMode="single" // Habilitar selección de fila única
                        selection={selectedFactura} // Vincular la selección al estado
                        onSelectionChange={(e) => setSelectedFactura(e.value)} // Actualizar el estado de selección
                        emptyMessage="No hay facturas."
                    >
                        <Column field="facturaId" header="ID Factura"></Column>
                        <Column field="pacienteNombre" header="Paciente"></Column>
                        <Column field="fechaEmision" header="Fecha Emisión" body={(rowData) => formatDate(rowData.fechaEmision)}></Column>
                        <Column field="monto" header="Monto Total" body={(rowData) => `$${rowData.monto.toFixed(2)}`}></Column>
                        {/* <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column> */}
                    </DataTable>
                </div>
            )}

            {/* Dialog for Factura Details */}
            <Dialog header={selectedFactura ? `Detalle de Factura #${selectedFactura.facturaId}` : "Detalle de Factura"}
                visible={showDetalleDialog} style={{ width: '60vw', minWidth: '400px' }} modal onHide={hideDetalleDialog}>

                {loadingDetalle && (
                    <div className="flex justify-content-center flex-column align-items-center p-5">
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" animationDuration=".5s" />
                        <p className="mt-3">Cargando detalles...</p>
                    </div>
                )}

                {errorDetalle && (
                    <Message severity="error" summary="Error" text={errorDetalle} className="mb-3 w-full" />
                )}

                {!loadingDetalle && !errorDetalle && detalleFactura.length > 0 && (
                    <DataTable value={detalleFactura} emptyMessage="No hay detalles para esta factura.">
                        <Column field="descripcion" header="Descripción Tratamiento"></Column>
                        <Column field="fecha" header="Fecha Tratamiento" body={(rowData) => formatDate(rowData.fecha)}></Column>
                        <Column field="costo" header="Costo" body={(rowData) => `$${rowData.costo.toFixed(2)}`}></Column>
                        {/* <Column field="cubierto" header="Cubierto por ARS" body={montoCubiertoBodyTemplate}></Column> */}
                    </DataTable>
                )}
                {!loadingDetalle && !errorDetalle && detalleFactura.length === 0 && !selectedFactura && (
                    <Message severity="info" summary="Información" text="Seleccione una factura para ver sus detalles." className="w-full" />
                )}
                {!loadingDetalle && !errorDetalle && detalleFactura.length === 0 && selectedFactura && (
                    <Message severity="info" summary="Información" text="No se encontraron detalles para esta factura." className="w-full" />
                )}
            </Dialog>

            {/* DIALOG: Para el formulario de registro de paciente */}
            {/* <Dialog
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
            </Dialog> */}
        </div>
    );
}