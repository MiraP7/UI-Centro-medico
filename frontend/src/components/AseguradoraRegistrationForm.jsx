import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog'; // Necesario para el ConfirmDialog si lo implementas aquí
// Importamos Toast y confirmDialog para las confirmaciones de eliminación
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { useRef } from 'react'; // Para el Toast

// Asegúrate de que los estilos de PrimeReact estén disponibles
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function AseguradoraRegistrationForm({ onAseguradoraSaved, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        contacto: '',
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [telefonoError, setTelefonoError] = useState(null);

    // Referencia para el Toast de PrimeReact
    const toast = useRef(null);

    // useEffect para inicializar el formulario si hay datos iniciales (para edición)
    useEffect(() => {
        const formatTelefonoForForm = (telefono) => {
            if (!telefono) return '';
            const cleaned = String(telefono).replace(/\D/g, '');
            if (cleaned.length === 10) {
                return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
            }
            return String(telefono);
        };

        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                direccion: initialData.direccion || '',
                telefono: formatTelefonoForForm(initialData.telefono) || '',
                email: initialData.email || '',
                contacto: initialData.contacto || '',
            });
        } else {
            // Resetear el formulario para un nuevo registro
            setFormData({
                nombre: '',
                direccion: '',
                telefono: '',
                email: '',
                contacto: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTelefonoChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.substring(0, 3) + '-' + value.substring(3);
        if (value.length > 7) value = value.substring(0, 7) + '-' + value.substring(7);
        if (value.length > 12) value = value.substring(0, 12);
        setFormData(prev => ({ ...prev, telefono: value }));
        if (telefonoError) setTelefonoError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setTelefonoError(null);
        setApiMessage(null);
        setLoading(true);

        // Validación básica
        if (!formData.nombre || !formData.direccion || !formData.telefono || !formData.email || !formData.contacto) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los campos son obligatorios.' });
            setLoading(false);
            return;
        }

        // Validación de formato de teléfono
        const telefonoRegex = /^\d{3}-\d{3}-\d{4}$/;
        const cleanedTelefono = formData.telefono.replace(/-/g, '');
        if (!telefonoRegex.test(formData.telefono) || cleanedTelefono.length !== 10) {
            setTelefonoError('El teléfono debe tener el formato 809-654-2156 y 10 dígitos numéricos.');
            setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, corrija el formato del teléfono.' });
            setLoading(false);
            return;
        }

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData
            ? `https://localhost:44388/api/Aseguradora/${initialData.aseguradoraId}` // Usar aseguradoraId para PUT
            : 'https://localhost:44388/api/Aseguradora'; // POST a la URL base

        // Preparar datos para envío (teléfono sin guiones)
        const aseguradoraDataToSend = {
            nombre: formData.nombre,
            direccion: formData.direccion,
            telefono: cleanedTelefono,
            email: formData.email,
            contacto: formData.contacto,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(aseguradoraDataToSend),
            });

            if (response.ok) {
                const result = await response.json();
                const successMessage = `Aseguradora ${initialData ? 'actualizada' : 'registrada'} exitosamente.`;
                setApiMessage({ severity: 'success', summary: 'Éxito', detail: successMessage });
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: successMessage, life: 3000 });
                console.log(`Aseguradora ${initialData ? 'actualizada' : 'registrada'}:`, result);

                // Llama al callback para notificar a la vista principal
                onAseguradoraSaved(result);

            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Error desconocido al ${initialData ? 'actualizar' : 'registrar'} la aseguradora.`;
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
            <Toast ref={toast} /> {/* Componente Toast para mostrar notificaciones */}

            {apiMessage && (
                <div className="col-12">
                    <Message severity={apiMessage.severity} summary={apiMessage.summary} text={apiMessage.detail} />
                </div>
            )}

            <div className="field col-12">
                <label htmlFor="nombre">Nombre</label>
                <InputText
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Seguros Salud Total"
                />
            </div>
            <div className="field col-12">
                <label htmlFor="direccion">Dirección</label>
                <InputText
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Av. Winston Churchill #100"
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="telefono">Teléfono</label>
                <InputText
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleTelefonoChange}
                    required
                    placeholder="Ej: 809-123-4567"
                    maxLength={12}
                    className={telefonoError ? 'p-invalid' : ''}
                />
                {telefonoError && <small className="p-error">{telefonoError}</small>}
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
                    placeholder="contacto@aseguradora.com"
                />
            </div>
            <div className="field col-12">
                <label htmlFor="contacto">Contacto</label>
                <InputText
                    id="contacto"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan Pérez (Gerente de Ventas)"
                />
            </div>

            <div className="col-12 flex justify-content-end gap-2 mt-4">
                <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} disabled={loading} />
                <Button
                    type="submit"
                    label={loading ? (initialData ? "Actualizando..." : "Registrando...") : (initialData ? "Actualizar Aseguradora" : "Registrar Aseguradora")}
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    disabled={loading}
                />
            </div>
        </form>
    );
}