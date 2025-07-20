import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';

// Estilos de PrimeReact (asegúrate de que estén disponibles globalmente o importados en el componente principal)
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function MedicoRegistrationForm({ onMedicoSaved, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        especialidad: '',
        telefono: '',
        email: '',
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const toast = useRef(null);

    // useEffect para inicializar el formulario si hay datos iniciales (para edición)
    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                apellido: initialData.apellido || '',
                especialidad: initialData.especialidad || '',
                telefono: initialData.telefono || '',
                email: initialData.email || '',
            });
        } else {
            // Resetear el formulario para un nuevo registro
            setFormData({
                nombre: '',
                apellido: '',
                especialidad: '',
                telefono: '',
                email: '',
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
        if (!formData.nombre || !formData.apellido || !formData.especialidad || !formData.telefono || !formData.email) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los campos son obligatorios.' });
            setLoading(false);
            return;
        }

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData
            ? `https://localhost:44388/api/Medico/${initialData.medicoId}` // Usar medicoId para PUT
            : 'https://localhost:44388/api/Medico'; // POST a la URL base

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
                const successMessage = `Médico ${initialData ? 'actualizado' : 'registrado'} exitosamente.`;
                setApiMessage({ severity: 'success', summary: 'Éxito', detail: successMessage });
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: successMessage, life: 3000 });
                console.log(`Médico ${initialData ? 'actualizado' : 'registrado'}:`, result);

                onMedicoSaved(result); // Llama al callback para notificar a la vista principal

            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Error desconocido al ${initialData ? 'actualizar' : 'registrar'} el médico.`;
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
                    placeholder="Ej: Dr. Juan"
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
            <div className="field col-12">
                <label htmlFor="especialidad">Especialidad</label>
                <InputText
                    id="especialidad"
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Pediatría, Cardiología"
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
                    placeholder="Ej: 809-111-2222"
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
                    placeholder="doctor@clinicaprincipal.com"
                />
            </div>

            <div className="col-12 flex justify-content-end gap-2 mt-4">
                <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} disabled={loading} />
                <Button
                    type="submit"
                    label={loading ? (initialData ? "Actualizando..." : "Registrando...") : (initialData ? "Actualizar Médico" : "Registrar Médico")}
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    disabled={loading}
                />
            </div>
        </form>
    );
}