import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message'; // Importa el componente Message para feedback al usuario
import 'primeicons/primeicons.css'; // Asegúrate de que los íconos estén importados
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Tu tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos base de PrimeReact
import 'primeflex/primeflex.css'; // Clases de utilidad de PrimeFlex

// Si PatientRegistrationForm es un componente modal,
// onPatientRegistered suele cerrar el modal y quizás actualizar una lista de pacientes.
// onCancel suele cerrar el modal sin hacer nada.
export default function PatientRegistrationForm({ onPatientRegistered, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        dni: '',
        dob: null, // Date object
        phone: '',
        email: '',
        gender: '',
        address: '',
        PolicyID: '',
        arsID: '',
    });

    const [loading, setLoading] = useState(false); // Nuevo estado para controlar la carga de la API
    const [apiMessage, setApiMessage] = useState(null); // Nuevo estado para mensajes de la API

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        setFormData(prev => ({ ...prev, dob: e.value }));
    };

    const handleSubmit = async (e) => { // La función ahora es asíncrona
        e.preventDefault(); // Previene la recarga de la página

        // Validaciones básicas del lado del cliente
        if (!formData.name || !formData.lastName || !formData.dni) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, Apellido y DNI son obligatorios.' });
            return;
        }

        setLoading(true); // Activa el estado de carga
        setApiMessage(null); // Limpia cualquier mensaje anterior

        // Formatear la fecha de nacimiento a un formato compatible con API (ej. YYYY-MM-DD)
        const formattedDob = formData.dob ? formData.dob.toISOString().split('T')[0] : null;

        const patientDataToSend = {
            nombre: formData.name,
            // lastName: formData.lastName,
            fechaNacimiento: formattedDob,
            sexo: formData.gender,
            direccion: formData.address,
            telefono: formData.phone,
            cedula: formData.dni,
            email: formData.email,
            polizaId: formData.PolicyID, // Usar camelCase estándar para JS/JSON si la API lo espera
            aseguradoraId: formData.arsID,       // Usar camelCase estándar para JS/JSON si la API lo espera
            // Añade cualquier otro campo que tu API espere
        };

        try {
            // Reemplaza 'https://api.example.com/patients' con la URL real de tu API para registrar pacientes
            const response = await fetch('https://localhost:44388/api/Paciente', {
                method: 'POST', // Usualmente POST para crear un nuevo recurso
                headers: {
                    'Content-Type': 'application/json',
                    // Si necesitas token de autenticación:
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(patientDataToSend), // Convierte el objeto a JSON
            });

            if (response.ok) {
                const result = await response.json();
                setApiMessage({ severity: 'success', summary: 'Éxito', detail: 'Paciente registrado exitosamente!' });
                console.log('Paciente registrado:', result);

                // Llama al callback para notificar al componente padre
                // Por ejemplo, para cerrar el modal y quizás actualizar una lista
                onPatientRegistered(result); // Pasa los datos del paciente registrado si la API los devuelve

                // Opcional: Limpiar el formulario después de un registro exitoso
                setFormData({
                    name: '',
                    lastName: '',
                    dni: '',
                    dob: null,
                    phone: '',
                    email: '',
                    gender: '',
                    address: '',
                    PolicyID: '',
                    arsID: '',
                });

            } else {
                // Manejar errores de la API (códigos de estado 4xx, 5xx)
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Error desconocido al registrar paciente.';
                setApiMessage({ severity: 'error', summary: 'Error', detail: `Fallo en el registro: ${errorMessage}` });
                console.error('Error de API:', response.status, errorData);
            }
        } catch (error) {
            // Manejar errores de red o errores antes de que la API responda
            setApiMessage({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar con el servidor. Verifique su conexión.' });
            console.error('Error de red o petición:', error);
        } finally {
            setLoading(false); // Siempre desactiva el estado de carga
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
            {/* Mensajes de la API */}
            {apiMessage && (
                <div className="col-12">
                    <Message severity={apiMessage.severity} summary={apiMessage.summary} text={apiMessage.detail} />
                </div>
            )}

            <div className="field col-12 md:col-6"><label htmlFor="name">Nombre</label><InputText id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="field col-12 md:col-6"><label htmlFor="lastName">Apellido</label><InputText id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
            <div className="field col-12 md:col-6"><label htmlFor="dni">DNI/Cédula</label><InputText id="dni" name="dni" value={formData.dni} onChange={handleChange} required /></div>
            <div className="field col-12 md:col-6"><label htmlFor="gender">Genero</label><InputText id="gender" name="gender" value={formData.gender} onChange={handleChange} /></div>
            <div className="field col-12 md:col-6"><label htmlFor="dob">Fecha de Nacimiento</label><Calendar id="dob" name="dob" value={formData.dob} onChange={handleDateChange} dateFormat="dd/mm/yy" showIcon /></div>
            <div className="field col-12 md:col-6"><label htmlFor="phone">Teléfono</label><InputText id="phone" name="phone" keyfilter="pnum" value={formData.phone} onChange={handleChange} /></div>
            <div className="field col-12 md:col-6"><label htmlFor="email">Correo Electrónico</label><InputText id="email" name="email" type="email" value={formData.email} onChange={handleChange} /></div>
            <div className="field col-12 md:col-6"><label htmlFor="address">Dirección</label><InputText id="address" name="address" value={formData.address} onChange={handleChange} /></div>
            <div className="field col-12 md:col-6"><label htmlFor="arsID">Aseguradora ID</label><InputText id="arsID" name="arsID" value={formData.arsID} onChange={handleChange} /></div>
            <div className="field col-12 md:col-6"><label htmlFor="PolicyID">Poliza ID</label><InputText id="PolicyID" name="PolicyID" value={formData.PolicyID} onChange={handleChange} /></div>

            <div className="col-12 flex justify-content-end gap-2 mt-4">
                <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} disabled={loading} />
                <Button
                    type="submit"
                    label={loading ? "Registrando..." : "Registrar Paciente"} // Cambia el texto y el ícono si está cargando
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    disabled={loading} // Deshabilita el botón mientras la petición está en curso
                />
            </div>
        </form>
    );
}