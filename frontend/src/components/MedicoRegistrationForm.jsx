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
        cedula: '',
        especialidad: '',
        telefono: '',
        email: '',
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [cedulaError, setCedulaError] = useState(null);
    const [telefonoError, setTelefonoError] = useState(null);
    const toast = useRef(null);

    // useEffect para inicializar el formulario si hay datos iniciales (para edición)
    useEffect(() => {
        const formatCedulaForForm = (cedula) => {
            if (!cedula) return '';
            const cleaned = String(cedula).replace(/\D/g, '');
            if (cleaned.length === 11) {
                return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 10)}-${cleaned.substring(10, 11)}`;
            }
            return String(cedula);
        };

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
                apellido: initialData.apellido || '',
                cedula: formatCedulaForForm(initialData.cedula) || '',
                especialidad: initialData.especialidad || '',
                telefono: formatTelefonoForForm(initialData.telefono) || '',
                email: initialData.email || '',
            });
        } else {
            // Resetear el formulario para un nuevo registro
            setFormData({
                nombre: '',
                apellido: '',
                cedula: '',
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

    const handleCedulaChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.substring(0, 3) + '-' + value.substring(3);
        if (value.length > 11) value = value.substring(0, 11) + '-' + value.substring(11);
        if (value.length > 13) value = value.substring(0, 13);
        setFormData(prev => ({ ...prev, cedula: value }));
        if (cedulaError) setCedulaError(null);
    };

    const handleTelefonoChange = (e) => {
        console.log('📞 handleTelefonoChange ejecutado, valor original:', e.target.value);
        let value = e.target.value.replace(/\D/g, '');
        console.log('📞 valor después de limpiar:', value);
        if (value.length > 3) value = value.substring(0, 3) + '-' + value.substring(3);
        if (value.length > 7) value = value.substring(0, 7) + '-' + value.substring(7);
        if (value.length > 12) value = value.substring(0, 12);
        console.log('📞 valor final formateado:', value);
        setFormData(prev => ({ ...prev, telefono: value }));
        if (telefonoError) setTelefonoError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setCedulaError(null);
        setTelefonoError(null);
        setApiMessage(null);
        setLoading(true);

        // Validación básica
        if (!formData.nombre || !formData.apellido || !formData.cedula || !formData.especialidad || !formData.telefono || !formData.email) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los campos son obligatorios.' });
            setLoading(false);
            return;
        }

        // Validación de formato de cédula
        const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;
        const cleanedCedula = formData.cedula.replace(/-/g, '');
        if (!cedulaRegex.test(formData.cedula) || cleanedCedula.length !== 11) {
            setCedulaError('La cédula debe tener el formato 123-4567890-2 y 11 dígitos numéricos.');
            setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, corrija el formato de la cédula.' });
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
            ? `https://localhost:44388/api/Medico/${initialData.medicoId}` // Usar medicoId para PUT
            : 'https://localhost:44388/api/Medico'; // POST a la URL base

        // Preparar datos para envío (sin guiones)
        const medicoDataToSend = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            cedula: cleanedCedula,
            especialidad: formData.especialidad,
            telefono: cleanedTelefono,
            email: formData.email,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(medicoDataToSend),
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
            <div className="field col-12 md:col-6">
                <label htmlFor="cedula">Cédula</label>
                <InputText
                    id="cedula"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleCedulaChange}
                    required
                    placeholder="Ej: 004-0000040-0"
                    maxLength={13}
                    className={cedulaError ? 'p-invalid' : ''}
                />
                {cedulaError && <small className="p-error">{cedulaError}</small>}
            </div>
            <div className="field col-12 md:col-6">
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
                    onChange={handleTelefonoChange}
                    required
                    placeholder="Ej: 809-111-2222"
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