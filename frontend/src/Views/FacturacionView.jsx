import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import FacturaService from '/src/services/FacturaService'; // Importa el servicio de facturas
import PatientRegistrationForm from '/src/components/PatientRegistrationForm'; // NUEVO: Importa el formulario de registro de pacientes

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const facturaService = new FacturaService();

export default function FacturacionView({ onClose }) {
    const [facturas, setFacturas] = useState([]);
    const [loadingFacturas, setLoadingFacturas] = useState(true);
    const [errorFacturas, setErrorFacturas] = useState(null);

    const [selectedFactura, setSelectedFactura] = useState(null);
    const [detalleFactura, setDetalleFactura] = useState([]);
    const [showDetalleDialog, setShowDetalleDialog] = useState(false);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState(null);

    // NUEVO ESTADO: Para controlar la visibilidad del diálogo de registro de paciente
    const [showPatientRegistrationModal, setShowPatientRegistrationModal] = useState(false);

    // Fetch all facturas on component mount
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

    // Function to load factura details
    const loadDetalleFactura = async (factura) => {
        setSelectedFactura(factura);
        setLoadingDetalle(true);
        setErrorDetalle(null);
        setShowDetalleDialog(true);
        try {
            const detalles = await facturaService.getDetalleFacturaByFacturaId(factura.facturaId);
            setDetalleFactura(detalles);
        } catch (err) {
            setErrorDetalle(`Error al cargar detalles: ${err.message}`);
            console.error("Error fetching factura details:", err);
            setDetalleFactura([]); // Clear details on error
        } finally {
            setLoadingDetalle(false);
        }
    };

    const hideDetalleDialog = () => {
        setShowDetalleDialog(false);
        setSelectedFactura(null);
        setDetalleFactura([]);
        setErrorDetalle(null);
    };

    // NUEVA FUNCIÓN: Manejar paciente registrado (solo cierra el modal en esta vista)
    const handlePatientRegistered = () => {
        console.log("Paciente registrado desde la vista de facturación.");
        setShowPatientRegistrationModal(false); // Cierra el modal de registro de paciente
        // En una aplicación real, podrías querer refrescar la lista de pacientes si es relevante aquí
    };

    // Template for 'Pagado' column (no changes here, as it's for the main invoice list)
    const pagadoBodyTemplate = (rowData) => {
        return (
            <i className={rowData.pagado ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                style={{ color: rowData.pagado ? 'green' : 'red', fontSize: '1.2rem' }}>
            </i>
        );
    };

    // Template for 'Acciones' column (no changes here)
    const actionBodyTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-search"
                className="p-button-rounded p-button-text p-button-sm"
                tooltip="Ver Detalles"
                tooltipOptions={{ position: 'bottom' }}
                onClick={() => loadDetalleFactura(rowData)}
            />
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // Body template for 'Monto Cubierto por ARS'
    const montoCubiertoBodyTemplate = (rowData) => {
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
    };

    // Función para manejar el clic del botón de Reporte de Cobertura
    const handleReporteCoberturaClick = () => {
        // Aquí puedes agregar la lógica para generar o mostrar el reporte de cobertura
        console.log("Generando reporte de cobertura...");
        // Por ejemplo, podrías abrir otro diálogo, redirigir a otra página, o iniciar una descarga.
        // setshowReporteCoberturaModal(true); // Si tuvieras un modal para el reporte
    };

    return (
        <div className="p-4">
            <div className="flex justify-content-between align-items-center mb-4">
                {/* <h2>Módulo de Facturación</h2> */}
                <div className="flex gap-2"> {/* Contenedor para los botones */}
                    {/* Botón: Registrar Paciente */}
                    <Button
                        label="Registrar Paciente"
                        icon="pi pi-user-plus"
                        className="p-button-success p-button-raised"
                        onClick={() => setShowPatientRegistrationModal(true)}
                    />
                    {/* Botón: Reporte de Cobertura (MODIFICADO) */}
                    <Button
                        label="Reporte de Cobertura"
                        icon="pi pi-file" // Icono de reporte (puedes probar 'pi pi-chart-bar' o 'pi pi-file-excel')
                        className="p-button-info p-button-raised" // Clase para color azul claro
                        onClick={handleReporteCoberturaClick}
                    />
                </div>
            </div>

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

            {!loadingFacturas && !errorFacturas && facturas.length > 0 && (
                <div className="card">
                    <DataTable value={facturas} paginator rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} facturas"
                        selectionMode="single"
                        onSelectionChange={(e) => loadDetalleFactura(e.value)}
                        emptyMessage="No hay facturas."
                    >
                        <Column field="facturaId" header="ID Factura"></Column>
                        <Column field="pacienteNombre" header="Paciente"></Column>
                        <Column field="fechaEmision" header="Fecha Emisión" body={(rowData) => formatDate(rowData.fechaEmision)}></Column>
                        <Column field="monto" header="Monto Total" body={(rowData) => `$${rowData.monto.toFixed(2)}`}></Column>
                        {/* <Column field="pagado" header="Pagado" body={pagadoBodyTemplate}></Column> */}
                        {/* <Column body={actionBodyTemplate} header="Acciones" exportable={false} style={{ width: '6rem' }}></Column> */}
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
                        <Column field="fecha" header="Fecha Tratamiento"></Column>
                        <Column field="costo" header="Costo" body={(rowData) => `$${rowData.costo.toFixed(2)}`}></Column>
                        <Column field="cubierto" header="Monto Cubierto por ARS" body={montoCubiertoBodyTemplate}></Column>
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

            {onClose && (
                <div className="flex justify-content-end mt-4">
                    <Button label="Cerrar Vista" icon="pi pi-times" className="p-button-secondary" onClick={onClose} />
                </div>
            )}
        </div>
    );
}