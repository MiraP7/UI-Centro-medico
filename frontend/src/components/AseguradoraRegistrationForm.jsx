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

    // Referencia para el Toast de PrimeReact
    const toast = useRef(null);

    // useEffect para inicializar el formulario si hay datos iniciales (para edición)
    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                direccion: initialData.direccion || '',
                telefono: initialData.telefono || '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiMessage(null);
        setLoading(true);

        // Validación básica
        if (!formData.nombre || !formData.direccion || !formData.telefono || !formData.email || !formData.contacto) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los campos son obligatorios.' });
            setLoading(false);
            return;
        }

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData
            ? `https://localhost:5185/api/Aseguradora/${initialData.aseguradoraId}` // Usar aseguradoraId para PUT
            : 'https://localhost:5185/api/Aseguradora'; // POST a la URL base

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(formData),
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
                    onChange={handleChange}
                    required
                    placeholder="Ej: 809-123-4567"
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