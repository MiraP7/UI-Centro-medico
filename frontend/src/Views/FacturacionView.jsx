import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import FacturaService from '../Services/FacturaService';
import PatientRegistrationForm from '../components/PatientRegistrationForm';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const facturaService = new FacturaService();

export default function FacturacionView() {
    const [facturas, setFacturas] = useState([]);
    const [loadingFacturas, setLoadingFacturas] = useState(true);
    const [errorFacturas, setErrorFacturas] = useState(null);
    const [selectedFactura, setSelectedFactura] = useState(null);
    const [detalleFactura, setDetalleFactura] = useState([]);
    const [showDetalleDialog, setShowDetalleDialog] = useState(false);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState(null);
    const [showPatientRegistrationModal, setShowPatientRegistrationModal] = useState(false);

    useEffect(() => {
        const fetchFacturas = async () => {
            setLoadingFacturas(true);
            setErrorFacturas(null);
            try {
                const data = await facturaService.getAllFacturas();
                setFacturas(data);
            } catch (err) {
                setErrorFacturas(`Error al cargar facturas: ${err.message}`);
            } finally {
                setLoadingFacturas(false);
            }
        };
        fetchFacturas();
    }, []);

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
            setDetalleFactura([]);
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

    const handlePatientRegistered = () => {
        setShowPatientRegistrationModal(false);
    };
    
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

    const montoCubiertoBodyTemplate = (rowData) => {
        const style = {
            color: rowData.cubierto > 0 ? 'green' : 'red',
            fontWeight: rowData.cubierto > 0 ? 'bold' : 'normal'
        };
        return <span style={style}>${rowData.cubierto.toFixed(2)}</span>;
    };

    const handleReporteCoberturaClick = () => {
        console.log("Generando reporte de cobertura...");
    };

    return (
        <div className="p-4">
            <div className="card p-4">
                <div className="flex justify-content-between align-items-center mb-4">
                    <h2 className="m-0">Módulo de Facturación</h2>
                    <div className="flex gap-2">
                        <Button
                            label="Registrar Paciente"
                            icon="pi pi-user-plus"
                            className="p-button-success p-button-raised"
                            onClick={() => setShowPatientRegistrationModal(true)}
                        />
                        <Button
                            label="Reporte de Cobertura"
                            icon="pi pi-file"
                            className="p-button-info p-button-raised"
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

                {!loadingFacturas && !errorFacturas && (
                    <DataTable
                        value={facturas}
                        paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} facturas"
                        selectionMode="single"
                        onRowClick={(e) => loadDetalleFactura(e.data)}
                        emptyMessage="No hay facturas registradas."
                        dataKey="facturaId"
                        responsiveLayout="scroll" >
                        <Column field="facturaId" header="ID Factura" sortable></Column>
                        <Column field="pacienteNombre" header="Paciente" sortable></Column>
                        <Column field="fechaEmision" header="Fecha Emisión" body={(rowData) => formatDate(rowData.fechaEmision)} sortable></Column>
                        <Column field="monto" header="Monto Total" body={(rowData) => `$${rowData.monto.toFixed(2)}`} sortable></Column>
                        <Column body={actionBodyTemplate} header="Acciones" exportable={false} style={{ width: '6rem' }}></Column>
                    </DataTable>
                )}
            </div>

            <Dialog
                header={selectedFactura ? `Detalle de Factura #${selectedFactura.facturaId}` : "Detalle de Factura"}
                visible={showDetalleDialog} style={{ width: '60vw', minWidth: '400px' }} modal onHide={hideDetalleDialog} >
                {loadingDetalle && (<div className="flex justify-content-center p-5"><ProgressSpinner /></div>)}
                {errorDetalle && <Message severity="error" text={errorDetalle} className="w-full" />}
                {!loadingDetalle && !errorDetalle && (
                    <DataTable value={detalleFactura} emptyMessage="No se encontraron detalles para esta factura.">
                        <Column field="descripcion" header="Descripción Tratamiento"></Column>
                        <Column field="fecha" header="Fecha Tratamiento" body={(rowData) => formatDate(rowData.fecha)}></Column>
                        <Column field="costo" header="Costo" body={(rowData) => `$${rowData.costo.toFixed(2)}`}></Column>
                        <Column field="cubierto" header="Monto Cubierto por ARS" body={montoCubiertoBodyTemplate}></Column>
                    </DataTable>
                )}
            </Dialog>

            <Dialog
                header="Registrar Paciente"
                visible={showPatientRegistrationModal}
                style={{ width: '50vw', minWidth: '350px' }}
                modal onHide={() => setShowPatientRegistrationModal(false)} >
                <PatientRegistrationForm
                    onPatientRegistered={handlePatientRegistered}
                    onCancel={() => setShowPatientRegistrationModal(false)}
                />
            </Dialog>
        </div>
    );
}