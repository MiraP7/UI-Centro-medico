import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { SplitButton } from 'primereact/splitbutton';
import { Badge } from 'primereact/badge';
import CitaService from '../Services/CitaService';
import CitaModal from './CitaModal';

/**
 * Ejemplo de integración del CRUD completo de citas
 * Muestra cómo usar todos los métodos del CitaService actualizado
 */
const CitasCrudExample = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCita, setEditingCita] = useState(null);
    const [pacientes, setPacientes] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const toast = useRef(null);
    const citaService = new CitaService();

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoadingData(true);
        await Promise.all([
            loadCitas(),
            loadPacientes(),
            loadMedicos()
        ]);
        setLoadingData(false);
    };

    const loadPacientes = async () => {
        try {
            const pacientesData = await citaService.getAllPacientes();
            setPacientes(pacientesData);
            console.log('Pacientes cargados:', pacientesData);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
            showToast('error', 'Error', 'No se pudieron cargar los pacientes');
        }
    };

    const loadMedicos = async () => {
        try {
            const medicosData = await citaService.getAllMedicos();
            setMedicos(medicosData);
            console.log('Médicos cargados:', medicosData);
        } catch (error) {
            console.error('Error al cargar médicos:', error);
            showToast('error', 'Error', 'No se pudieron cargar los médicos');
        }
    };

    const loadCitas = async () => {
        setLoading(true);
        setError('');

        try {
            const citasData = await citaService.getAllCitas();
            setCitas(citasData);
            console.log('Citas cargadas:', citasData);
        } catch (error) {
            setError(`Error al cargar las citas: ${error.message}`);
            showToast('error', 'Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCita = () => {
        setEditingCita(null);
        setShowModal(true);
    };

    const handleEditCita = (cita) => {
        setEditingCita(cita);
        setShowModal(true);
    };

    const handleViewCita = (cita) => {
        // Mostrar detalles completos de la cita
        const detalles = `
🆔 ID: ${cita.citaId}
👤 Paciente: ${cita.patient}
👨‍⚕️ Médico: ${cita.medicoNombre}
📅 Fecha: ${cita.date}
🕐 Hora: ${cita.time}
📝 Motivo: ${cita.motivoConsulta}
📊 Estado: ${cita.estadoDescripcion}
        `.trim();

        showToast('info', 'Detalles de la Cita', detalles);
        console.log('Detalles completos de la cita:', cita);
    };

    const handleDeleteCita = (cita) => {
        confirmDialog({
            message: `¿Está seguro que desea eliminar la cita de ${cita.patient}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteCita(cita),
            reject: () => console.log('Eliminación cancelada'),
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-text'
        });
    };

    const handleDuplicateCita = (cita) => {
        // Crear una copia de la cita para duplicar
        const citaDuplicada = {
            ...cita,
            motivoConsulta: `${cita.motivoConsulta} (Copia)`,
            estadoId: 102 // Pendiente por defecto
        };
        setEditingCita(citaDuplicada);
        setShowModal(true);
        showToast('info', 'Duplicar Cita', 'Se ha cargado una copia de la cita para su edición');
    };

    const handleChangeStatus = async (cita, nuevoEstadoId) => {
        try {
            setLoading(true);
            const citaActualizada = {
                ...cita,
                estadoId: nuevoEstadoId
            };

            await citaService.updateCita(cita.citaId, citaActualizada);
            showToast('success', 'Estado Actualizado', 'El estado de la cita ha sido cambiado');
            await loadCitas();
        } catch (error) {
            showToast('error', 'Error', `Error al cambiar estado: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteCita = async (cita) => {
        try {
            // Por ahora comentado ya que el endpoint no existe
            // await citaService.deleteCita(cita.citaId);

            // Simulación de eliminación exitosa
            console.log('Eliminando cita:', cita.citaId);
            showToast('info', 'Información', 'Funcionalidad de eliminación no disponible aún');

            // await loadCitas(); // Recargar lista después de eliminar
        } catch (error) {
            showToast('error', 'Error', `Error al eliminar cita: ${error.message}`);
        }
    };

    const onCitaCreated = async (newCita) => {
        showToast('success', 'Éxito', 'Cita registrada exitosamente');
        await loadCitas(); // Recargar lista
    };

    const onCitaUpdated = async (updatedCita) => {
        showToast('success', 'Éxito', 'Cita actualizada exitosamente');
        await loadCitas(); // Recargar lista
    };

    const showToast = (severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    };

    // Templates para columnas
    const fechaTemplate = (rowData) => {
        if (!rowData.date) return 'N/A';
        return rowData.date;
    };

    const horaTemplate = (rowData) => {
        if (!rowData.time) return 'N/A';
        return rowData.time;
    };

    const estadoTemplate = (rowData) => {
        const getStateBadgeClass = (estado) => {
            switch (estado) {
                case 'Activo': return 'p-badge-success';
                case 'Completado': return 'p-badge-success';
                case 'Aprobado': return 'p-badge-info';
                case 'Pendiente': return 'p-badge-warning';
                case 'Cancelado': return 'p-badge-danger';
                case 'Rechazado': return 'p-badge-danger';
                case 'Inactivo': return 'p-badge-secondary';
                default: return 'p-badge-secondary';
            }
        };

        const badgeClass = getStateBadgeClass(rowData.estadoDescripcion);
        return (
            <span className={`p-badge ${badgeClass}`}>
                {rowData.estadoDescripcion || 'N/A'}
            </span>
        );
    };

    const actionTemplate = (rowData) => {
        const estadoMenuItems = [
            {
                label: 'Marcar como Completado',
                icon: 'pi pi-check',
                command: () => handleChangeStatus(rowData, 103)
            },
            {
                label: 'Marcar como Cancelado',
                icon: 'pi pi-times',
                command: () => handleChangeStatus(rowData, 104)
            },
            {
                label: 'Marcar como Aprobado',
                icon: 'pi pi-thumbs-up',
                command: () => handleChangeStatus(rowData, 105)
            },
            {
                label: 'Marcar como Pendiente',
                icon: 'pi pi-clock',
                command: () => handleChangeStatus(rowData, 102)
            }
        ];

        const moreActions = [
            {
                label: 'Duplicar Cita',
                icon: 'pi pi-copy',
                command: () => handleDuplicateCita(rowData)
            },
            {
                label: 'Imprimir Detalles',
                icon: 'pi pi-print',
                command: () => console.log('Imprimir:', rowData)
            },
            {
                label: 'Enviar Recordatorio',
                icon: 'pi pi-send',
                command: () => console.log('Enviar recordatorio:', rowData)
            }
        ];

        return (
            <div className="flex gap-1 align-items-center">
                {/* Botón Ver */}
                <Button
                    icon="pi pi-eye"
                    size="small"
                    severity="info"
                    tooltip="Ver detalles"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleViewCita(rowData)}
                />

                {/* Botón Editar */}
                <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="warning"
                    tooltip="Editar cita"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleEditCita(rowData)}
                />

                {/* Botón Cambiar Estado */}
                <SplitButton
                    icon="pi pi-cog"
                    size="small"
                    severity="secondary"
                    tooltip="Cambiar estado"
                    tooltipOptions={{ position: 'top' }}
                    model={estadoMenuItems}
                    onClick={() => console.log('Estado actual:', rowData.estadoDescripcion)}
                />

                {/* Botón Más Acciones */}
                <SplitButton
                    icon="pi pi-ellipsis-v"
                    size="small"
                    severity="help"
                    tooltip="Más acciones"
                    tooltipOptions={{ position: 'top' }}
                    model={moreActions}
                />

                {/* Botón Eliminar */}
                <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    tooltip="Eliminar cita"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleDeleteCita(rowData)}
                />
            </div>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Gestión de Citas - CRUD Completo</h2>
                    <div className="flex gap-2 mt-2">
                        <Badge value={citas.length} severity="info"></Badge>
                        <span className="text-sm text-color-secondary">
                            Total de citas registradas
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {/* Botones de Filtros Rápidos */}
                    <Button
                        icon="pi pi-filter"
                        label="Hoy"
                        size="small"
                        severity="secondary"
                        outlined
                        onClick={() => console.log('Filtrar citas de hoy')}
                        tooltip="Filtrar citas de hoy"
                    />

                    <Button
                        icon="pi pi-clock"
                        label="Pendientes"
                        size="small"
                        severity="warning"
                        outlined
                        onClick={() => console.log('Filtrar pendientes')}
                        tooltip="Filtrar citas pendientes"
                    />

                    {/* Botones de Acción */}
                    <Button
                        icon="pi pi-refresh"
                        label="Recargar"
                        size="small"
                        onClick={loadInitialData}
                        disabled={loading || loadingData}
                        severity="info"
                        outlined
                    />

                    <Button
                        icon="pi pi-download"
                        label="Exportar"
                        size="small"
                        severity="help"
                        outlined
                        onClick={() => console.log('Exportar citas')}
                        tooltip="Exportar lista de citas"
                    />

                    <Button
                        icon="pi pi-plus"
                        label="Nueva Cita"
                        size="small"
                        onClick={handleCreateCita}
                        disabled={loading || loadingData}
                        className="p-button-success"
                    />
                </div>
            </div>

            {error && (
                <Message severity="error" text={error} className="w-full mb-3" />
            )}

            <DataTable
                value={citas}
                paginator
                rows={10}
                dataKey="citaId"
                loading={loading || loadingData}
                emptyMessage="No hay citas para mostrar"
                className="p-datatable-gridlines"
                showGridlines
                size="small"
                sortField="date"
                sortOrder={-1}
                stripedRows
                responsiveLayout="stack"
                breakpoint="768px"
                globalFilterFields={['patient', 'medicoNombre', 'motivoConsulta', 'estadoDescripcion']}
                header={
                    <div className="flex justify-content-between align-items-center">
                        <span className="text-xl font-bold">Lista de Citas</span>
                        <div className="flex gap-2">
                            {loadingData && (
                                <span className="text-sm text-color-secondary">
                                    <i className="pi pi-spin pi-spinner mr-2"></i>
                                    Cargando datos...
                                </span>
                            )}
                        </div>
                    </div>
                }
            >
                <Column
                    field="citaId"
                    header="ID"
                    sortable
                    style={{ width: '80px' }}
                />

                <Column
                    field="patient"
                    header="Paciente"
                    sortable
                    style={{ minWidth: '200px' }}
                />

                <Column
                    field="medicoNombre"
                    header="Médico"
                    sortable
                    style={{ minWidth: '200px' }}
                />

                <Column
                    field="date"
                    header="Fecha"
                    body={fechaTemplate}
                    sortable
                    style={{ width: '120px' }}
                />

                <Column
                    field="time"
                    header="Hora"
                    body={horaTemplate}
                    sortable
                    style={{ width: '100px' }}
                />

                <Column
                    field="motivoConsulta"
                    header="Motivo"
                    style={{ minWidth: '200px' }}
                />

                <Column
                    field="estadoDescripcion"
                    header="Estado"
                    body={estadoTemplate}
                    sortable
                    style={{ width: '120px' }}
                />

                <Column
                    header="Acciones"
                    body={actionTemplate}
                    style={{ width: '220px', minWidth: '220px' }}
                    frozen
                    alignFrozen="right"
                />
            </DataTable>

            {/* Modal para crear/editar citas */}
            <CitaModal
                visible={showModal}
                onHide={() => setShowModal(false)}
                citaToEdit={editingCita}
                pacientes={pacientes}
                medicos={medicos}
                onCitaCreated={onCitaCreated}
                onCitaUpdated={onCitaUpdated}
            />

            <div className="mt-4 grid">
                <div className="col-12 md:col-6">
                    <h4>Métodos CRUD Disponibles:</h4>
                    <ul className="list-none p-0">
                        <li className="flex align-items-center mb-2">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <strong>CREATE:</strong> POST /api/Cita - Implementado
                        </li>
                        <li className="flex align-items-center mb-2">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <strong>READ:</strong> GET /api/Cita/all - Con enriquecimiento
                        </li>
                        <li className="flex align-items-center mb-2">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <strong>READ (Individual):</strong> GET /api/Cita/{`{id}`} - Implementado
                        </li>
                        <li className="flex align-items-center mb-2">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <strong>UPDATE:</strong> PUT /api/Cita/{`{id}`} - Implementado
                        </li>
                        <li className="flex align-items-center mb-2">
                            <i className="pi pi-exclamation-triangle text-orange-500 mr-2"></i>
                            <strong>DELETE:</strong> DELETE /api/Cita/{`{id}`} - Pendiente endpoint
                        </li>
                    </ul>
                </div>

                <div className="col-12 md:col-6">
                    <h4>Funciones de los Botones:</h4>
                    <ul className="list-none p-0">
                        <li className="flex align-items-center mb-2">
                            <Button icon="pi pi-eye" size="small" severity="info" className="mr-2" />
                            <span>Ver detalles completos de la cita</span>
                        </li>
                        <li className="flex align-items-center mb-2">
                            <Button icon="pi pi-pencil" size="small" severity="warning" className="mr-2" />
                            <span>Editar información de la cita</span>
                        </li>
                        <li className="flex align-items-center mb-2">
                            <Button icon="pi pi-cog" size="small" severity="secondary" className="mr-2" />
                            <span>Cambiar estado de la cita</span>
                        </li>
                        <li className="flex align-items-center mb-2">
                            <Button icon="pi pi-ellipsis-v" size="small" severity="help" className="mr-2" />
                            <span>Más acciones (duplicar, imprimir, etc.)</span>
                        </li>
                        <li className="flex align-items-center mb-2">
                            <Button icon="pi pi-trash" size="small" severity="danger" className="mr-2" />
                            <span>Eliminar cita (próximamente)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CitasCrudExample;
