import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';

// Estilos de PrimeReact
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function UserRegistrationForm({ onUserSaved, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        usuario1: '',
        contraseña: '',
        confirmarContraseña: '',
        estadoId: 100 // Por defecto: Activo
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const toast = useRef(null);

    // Opciones de estado
    const estadoOptions = [
        { label: 'Activo', value: 100 },
        { label: 'Inactivo', value: 101 }
    ];

    // useEffect para inicializar el formulario si hay datos iniciales (para edición)
    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                apellido: initialData.apellido || '',
                email: initialData.email || '',
                usuario1: initialData.usuario1 || '',
                contraseña: '', // No pre-llenar contraseña por seguridad
                confirmarContraseña: '',
                estadoId: initialData.estadoId || 100,
            });
        } else {
            // Resetear el formulario para un nuevo registro
            setFormData({
                nombre: '',
                apellido: '',
                email: '',
                usuario1: '',
                contraseña: '',
                confirmarContraseña: '',
                estadoId: 100,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEstadoChange = (e) => {
        setFormData(prev => ({ ...prev, estadoId: e.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setPasswordError(null);
        setApiMessage(null);
        setLoading(true);

        // Validación básica
        if (!formData.nombre || !formData.apellido || !formData.email || !formData.usuario1) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, Apellido, Email y Usuario son obligatorios.' });
            setLoading(false);
            return;
        }

        // Validación de contraseña (solo para nuevos usuarios o si se proporciona)
        if (!initialData) { // Nuevo usuario
            if (!formData.contraseña) {
                setPasswordError('La contraseña es requerida para nuevos usuarios.');
                setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, proporcione una contraseña.' });
                setLoading(false);
                return;
            }
        }

        // Validación de coincidencia de contraseñas (si se proporciona contraseña)
        if (formData.contraseña && formData.contraseña !== formData.confirmarContraseña) {
            setPasswordError('Las contraseñas no coinciden.');
            setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Las contraseñas deben coincidir.' });
            setLoading(false);
            return;
        }

        // Validación de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, ingrese un email válido.' });
            setLoading(false);
            return;
        }

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData
            ? `https://localhost:44388/api/Usuario/${initialData.usuarioId}` // Usar usuarioId para PUT
            : 'https://localhost:44388/api/Usuario'; // POST a la URL base

        // Preparar datos para envío
        const userDataToSend = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            usuario1: formData.usuario1,
            estadoId: formData.estadoId,
        };

        // Solo incluir contraseña si se proporciona
        if (formData.contraseña) {
            userDataToSend.contraseña = formData.contraseña;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(userDataToSend),
            });

            if (response.ok) {
                const result = await response.json();
                const successMessage = `Usuario ${initialData ? 'actualizado' : 'registrado'} exitosamente.`;
                setApiMessage({ severity: 'success', summary: 'Éxito', detail: successMessage });
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: successMessage, life: 3000 });
                console.log(`Usuario ${initialData ? 'actualizado' : 'registrado'}:`, result);

                onUserSaved(result); // Llama al callback para notificar a la vista principal

            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Error desconocido al ${initialData ? 'actualizar' : 'registrar'} el usuario.`;
                setApiMessage({ severity: 'error', summary: 'Error', detail: `Fallo en el ${initialData ? 'actualización' : 'registro'}: ${errorMessage}` });
                toast.current.show({ severity: 'error', summary: 'Error', detail: errorMessage, life: 5000 });
                console.error('Error de API:', response.status, errorData);
            }
        } catch (error) {
            setApiMessage({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar con el servidor. Verifique su conexión.' });
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con el servidor.', life: 5000 });
            console.error('Error de red o petición:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
            <Toast ref={toast} />

            {apiMessage && (
                <div className="col-12">
                    <Message severity={apiMessage.severity} summary={apiMessage.summary} text={apiMessage.detail} />
                </div>
            )}

            <div className="field col-12 md:col-6">
                <label htmlFor="nombre">Nombre</label>
                <InputText
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan"
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="apellido">Apellido</label>
                <InputText
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Pérez"
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="email">Email</label>
                <InputText
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="usuario@clinica.com"
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="usuario1">Usuario</label>
                <InputText
                    id="usuario1"
                    name="usuario1"
                    value={formData.usuario1}
                    onChange={handleChange}
                    required
                    placeholder="Ej: jperez"
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="contraseña">Contraseña {initialData && <small>(Dejar en blanco para mantener actual)</small>}</label>
                <Password
                    id="contraseña"
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={handleChange}
                    placeholder={initialData ? "Nueva contraseña (opcional)" : "Contraseña"}
                    toggleMask
                    feedback={!initialData}
                    className={passwordError ? 'p-invalid' : ''}
                />
                {passwordError && <small className="p-error">{passwordError}</small>}
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="confirmarContraseña">Confirmar Contraseña</label>
                <Password
                    id="confirmarContraseña"
                    name="confirmarContraseña"
                    value={formData.confirmarContraseña}
                    onChange={handleChange}
                    placeholder="Confirmar contraseña"
                    feedback={false}
                    className={passwordError ? 'p-invalid' : ''}
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="estadoId">Estado</label>
                <Dropdown
                    id="estadoId"
                    value={formData.estadoId}
                    options={estadoOptions}
                    onChange={handleEstadoChange}
                    placeholder="Seleccionar Estado"
                />
            </div>

            <div className="col-12 flex justify-content-end gap-2 mt-4">
                <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} disabled={loading} />
                <Button
                    type="submit"
                    label={loading ? (initialData ? "Actualizando..." : "Registrando...") : (initialData ? "Actualizar Usuario" : "Registrar Usuario")}
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    disabled={loading}
                />
            </div>
        </form>
    );
}
