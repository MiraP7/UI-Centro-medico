import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';

import UserRegistrationForm from '../components/UserRegistrationForm';
import UserService from '../Services/UserService';

// Estilos de PrimeReact
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const userService = new UserService();

export default function UserView({ onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [apiMessage, setApiMessage] = useState(null);

    const toast = useRef(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setApiMessage(null);
        try {
            const data = await userService.getAllUsers();
            console.log("📊 Usuarios obtenidos del API:", data);
            console.log("📊 Primer usuario para debug:", data[0]);
            console.log("📊 Campos disponibles:", data[0] ? Object.keys(data[0]) : 'No hay usuarios');
            setUsers(data);
        } catch (error) {
            console.error("❌ Error al cargar usuarios:", error);
            setApiMessage({
                severity: 'error',
                summary: 'Error',
                detail: `Error al cargar usuarios: ${error.message}`
            });
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setShowUserModal(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowUserModal(true);
    };

    const handleDeleteUser = (user) => {
        confirmDialog({
            message: `¿Está seguro que desea eliminar el usuario "${user.usuario1 || user.nombreUsuario}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteUser(user),
            reject: () => console.log('Eliminación cancelada'),
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-text'
        });
    };

    const deleteUser = async (user) => {
        try {
            await userService.deleteUser(user.usuarioId);
            setUsers(users.filter(u => u.usuarioId !== user.usuarioId));
            showToast('success', 'Éxito', 'Usuario eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showToast('error', 'Error', `Error al eliminar usuario: ${error.message}`);
        }
    };

    const handleUserSaved = (savedUser) => {
        console.log('Usuario guardado:', savedUser);
        setShowUserModal(false);
        setEditingUser(null);
        fetchUsers(); // Recargar la lista
        showToast('success', 'Éxito', `Usuario ${editingUser ? 'actualizado' : 'registrado'} exitosamente`);
    };

    const showToast = (severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    };

    // Template para mostrar el estado
    const statusTemplate = (rowData) => {
        // Si no hay estadoId en la respuesta, usar un estado por defecto
        const estadoId = rowData.estadoId || 100; // Por defecto "Activo"

        const getStatusDetails = (estadoId) => {
            switch (estadoId) {
                case 100:
                    return { label: 'Activo', severity: 'success' };
                case 101:
                    return { label: 'Inactivo', severity: 'danger' };
                default:
                    return { label: 'Activo', severity: 'success' };
            }
        };

        const status = getStatusDetails(estadoId);
        return <Tag value={status.label} severity={status.severity} />;
    };

    // Template para los botones de acción
    const actionTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="warning"
                    tooltip="Editar usuario"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleEditUser(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    tooltip="Eliminar usuario"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleDeleteUser(rowData)}
                />
            </div>
        );
    };

    // Template para el nombre completo
    const fullNameTemplate = (rowData) => {
        // Si no hay nombre y apellido separados, mostrar el rolNombre o usuario1
        if (rowData.nombre && rowData.apellido) {
            return `${rowData.nombre} ${rowData.apellido}`;
        }
        return rowData.rolNombre || rowData.usuario1 || 'N/A';
    };

    // Toolbar de la tabla
    const leftToolbarTemplate = () => {
        return (
            <div className="flex align-items-center gap-2">
                <Button
                    label="Nuevo Usuario"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={handleCreateUser}
                />
                <Button
                    label="Actualizar"
                    icon="pi pi-refresh"
                    severity="help"
                    onClick={fetchUsers}
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex align-items-center gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        placeholder="Buscar usuarios..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </span>
            </div>
        );
    };

    return (
        <div className="user-view">
            <Toast ref={toast} />
            <ConfirmDialog />

            {apiMessage && (
                <Message
                    severity={apiMessage.severity}
                    summary={apiMessage.summary}
                    text={apiMessage.detail}
                    className="mb-3 w-full"
                />
            )}

            <Toolbar
                className="mb-4"
                start={leftToolbarTemplate}
                end={rightToolbarTemplate}
            />

            <DataTable
                value={users}
                loading={loading}
                globalFilter={globalFilter}
                emptyMessage="No se encontraron usuarios."
                responsiveLayout="scroll"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                stripedRows
                showGridlines
            >
                <Column
                    field="usuarioId"
                    header="ID"
                    sortable
                    style={{ width: '80px' }}
                />
                <Column
                    header="Nombre/Rol"
                    body={fullNameTemplate}
                    sortable
                    sortField="rolNombre"
                />
                <Column
                    field="usuario1"
                    header="Usuario"
                    sortable
                />
                <Column
                    field="rolNombre"
                    header="Rol"
                    sortable
                />
                <Column
                    field="estadoId"
                    header="Estado"
                    body={statusTemplate}
                    sortable
                    style={{ width: '120px' }}
                />
                <Column
                    header="Acciones"
                    body={actionTemplate}
                    style={{ width: '150px', minWidth: '150px' }}
                    frozen
                    alignFrozen="right"
                />
            </DataTable>

            {/* Dialog para Registrar/Editar Usuario */}
            <Dialog
                header={editingUser ? "Editar Usuario" : "Registrar Usuario"}
                visible={showUserModal}
                style={{ width: '70vw', minWidth: '400px' }}
                onHide={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                }}
                modal
            >
                <UserRegistrationForm
                    initialData={editingUser}
                    onUserSaved={handleUserSaved}
                    onCancel={() => {
                        setShowUserModal(false);
                        setEditingUser(null);
                    }}
                />
            </Dialog>

            {/* Botón para cerrar la vista */}
            {/* <div className="flex justify-content-end mt-4">
                <Button
                    label="Cerrar"
                    icon="pi pi-times"
                    className="p-button-secondary"
                    onClick={onClose}
                />
            </div> */}
        </div>
    );
}
