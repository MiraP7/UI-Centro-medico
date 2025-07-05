import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox'; // <-- Import Checkbox
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';

export default function PatientRegistrationForm({ onPatientRegistered, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        dni: '',
        dob: null,
        phone: '',
        email: '',
        sex: null,
        address: '',
        // arsID y PolicyID serán manejados por el estado de 'isInsured'
        PolicyID: '',
        arsID: '',
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [isInsured, setIsInsured] = useState(false); // <-- Nuevo estado para "Asegurado"

    const sexOptions = [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSexChange = (e) => {
        setFormData(prev => ({ ...prev, sex: e.value }));
    };

    const handleDateChange = (e) => {
        setFormData(prev => ({ ...prev, dob: e.value }));
    };

    // Manejador para el checkbox "Asegurado"
    const handleIsInsuredChange = (e) => {
        const checked = e.checked;
        setIsInsured(checked);
        // Si se desmarca "Asegurado", limpiar los campos relacionados
        if (!checked) {
            setFormData(prev => ({ ...prev, PolicyID: '', arsID: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas del lado del cliente
        if (!formData.name || !formData.lastName || !formData.dni || !formData.sex) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, Apellido, DNI y Sexo son obligatorios.' });
            return;
        }

        // Validaciones condicionales para arsID y PolicyID
        if (isInsured) {
            if (!formData.arsID || !formData.PolicyID) {
                setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Si el paciente está asegurado, Aseguradora ID y Póliza ID son obligatorios.' });
                return;
            }
        }

        setLoading(true);
        setApiMessage(null);

        const formattedDob = formData.dob ? formData.dob.toISOString().split('T')[0] : null;

        const patientDataToSend = {
            nombre: formData.name,
            apellido: formData.lastName,
            fechaNacimiento: formattedDob,
            sexo: formData.sex,
            direccion: formData.address,
            telefono: formData.phone,
            cedula: formData.dni,
            email: formData.email,
            // Solo envía PolicyID y arsID si isInsured es true, o si tienen algún valor
            // Aunque la API podría manejar nulos si no son requeridos.
            // Para asegurar que se envían solo si son relevantes, puedes hacer esto:
            ...(isInsured && { polizaId: formData.PolicyID }), // Conditionally add
            ...(isInsured && { aseguradoraId: formData.arsID }), // Conditionally add
            // Si tu API espera estos campos siempre, incluso nulos, entonces mantenlos incondicionalmente
            // polizaId: formData.PolicyID,
            // aseguradoraId: formData.arsID,
        };

        try {
            const response = await fetch('https://localhost:44388/api/Paciente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientDataToSend),
            });

            if (response.ok) {
                const result = await response.json();
                setApiMessage({ severity: 'success', summary: 'Éxito', detail: 'Paciente registrado exitosamente!' });
                console.log('Paciente registrado:', result);

                onPatientRegistered(result);

                // Limpiar el formulario
                setFormData({
                    name: '',
                    lastName: '',
                    dni: '',
                    dob: null,
                    phone: '',
                    email: '',
                    sex: null,
                    address: '',
                    PolicyID: '', // Limpiar también estos
                    arsID: '',    // Limpiar también estos
                });
                setIsInsured(false); // Reiniciar el checkbox

            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Error desconocido al registrar paciente.';
                setApiMessage({ severity: 'error', summary: 'Error', detail: `Fallo en el registro: ${errorMessage}` });
                console.error('Error de API:', response.status, errorData);
            }
        } catch (error) {
            setApiMessage({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar con el servidor. Verifique su conexión.' });
            console.error('Error de red o petición:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
            {apiMessage && (
                <div className="col-12">
                    <Message severity={apiMessage.severity} summary={apiMessage.summary} text={apiMessage.detail} />
                </div>
            )}

            <div className="field col-12 md:col-6"><label htmlFor="name">Nombre</label><InputText id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="field col-12 md:col-6"><label htmlFor="lastName">Apellido</label><InputText id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
            <div className="field col-12 md:col-6"><label htmlFor="dni">DNI/Cédula</label><InputText id="dni" name="dni" value={formData.dni} onChange={handleChange} required /></div>

            <div className="field col-12 md:col-6">
                <label htmlFor="sex">Sexo</label>
                <Dropdown
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    options={sexOptions}
                    onChange={handleSexChange}
                    placeholder="Seleccione un sexo"
                    required
                />
            </div>

            <div className="field col-12 md:col-6"><label htmlFor="dob">Fecha de Nacimiento</label><Calendar id="dob" name="dob" value={formData.dob} onChange={handleDateChange} dateFormat="dd/mm/yy" showIcon /></div>
            <div className="field col-12 md:col-6"><label htmlFor="phone">Teléfono</label><InputText id="phone" name="phone" keyfilter="pnum" value={formData.phone} onChange={handleChange} /></div>
            <div className="field col-12 md:col-6"><label htmlFor="email">Correo Electrónico</label><InputText id="email" name="email" type="email" value={formData.email} onChange={handleChange} /></div>
            <div className="field col-12 md:col-6"><label htmlFor="address">Dirección</label><InputText id="address" name="address" value={formData.address} onChange={handleChange} /></div>

            {/* Nuevo campo Checkbox "Asegurado" */}
            <div className="field col-12 flex align-items-center gap-2"> {/* Usar flex y gap para alinear checkbox y label */}
                <Checkbox
                    inputId="isInsured"
                    name="isInsured"
                    checked={isInsured}
                    onChange={handleIsInsuredChange}
                />
                <label htmlFor="isInsured" className="p-checkbox-label">Asegurado</label>
            </div>

            {/* Campos arsID y PolicyID se muestran/ocultan condicionalmente */}
            {isInsured && (
                <>
                    <div className="field col-12 md:col-6"><label htmlFor="arsID">Aseguradora ID</label><InputText id="arsID" name="arsID" value={formData.arsID} onChange={handleChange} required={isInsured} /></div>
                    <div className="field col-12 md:col-6"><label htmlFor="PolicyID">Poliza ID</label><InputText id="PolicyID" name="PolicyID" value={formData.PolicyID} onChange={handleChange} required={isInsured} /></div>
                </>
            )}

            <div className="col-12 flex justify-content-end gap-2 mt-4">
                <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} disabled={loading} />
                <Button
                    type="submit"
                    label={loading ? "Registrando..." : "Registrar Paciente"}
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    disabled={loading}
                />
            </div>
        </form>
    );
}