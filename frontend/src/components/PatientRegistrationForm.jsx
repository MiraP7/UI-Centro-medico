import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { RadioButton } from 'primereact/radiobutton'; // Import RadioButton

import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';

export default function PatientRegistrationForm({ onPatientRegistered, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        dni: '',
        dob: null, // Date object
        phone: '',
        email: '',
        Sex: '', // Will store 'M' or 'F'
        address: '',
        PolicyID: '',
        arsID: '',
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        setFormData(prev => ({ ...prev, dob: e.value }));
    };

    // Specific handler for RadioButton as its onChange returns { originalEvent, value, checked }
    const handleSexChange = (e) => {
        setFormData(prev => ({ ...prev, Sex: e.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas del lado del cliente
        if (!formData.name || !formData.lastName || !formData.dni || !formData.Sex) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, Apellido, DNI y Sexo son obligatorios.' });
            return;
        }

        setLoading(true);
        setApiMessage(null);

        const formattedDob = formData.dob ? formData.dob.toISOString().split('T')[0] : null;

        const patientDataToSend = {
            nombre: formData.name,
            // Si tu API espera 'apellido' en lugar de 'lastName', asegúrate de mapearlo correctamente
            apellido: formData.lastName, // Assuming API expects 'apellido' or similar
            fechaNacimiento: formattedDob,
            sexo: formData.Sex, // 'M' or 'F'
            direccion: formData.address,
            telefono: formData.phone,
            cedula: formData.dni,
            email: formData.email,
            polizaId: formData.PolicyID,
            aseguradoraId: formData.arsID,
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

                // Clear form
                setFormData({
                    name: '',
                    lastName: '',
                    dni: '',
                    dob: null,
                    phone: '',
                    email: '',
                    Sex: '', // Reset Sex field
                    address: '',
                    PolicyID: '',
                    arsID: '',
                });

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
            {/* Mensajes de la API */}
            {apiMessage && (
                <div className="col-12">
                    <Message severity={apiMessage.severity} summary={apiMessage.summary} text={apiMessage.detail} />
                </div>
            )}

            <div className="field col-12 md:col-6">
                <label htmlFor="name">Nombre</label>
                <InputText id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="lastName">Apellido</label>
                <InputText id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="dni">DNI/Cédula</label>
                <InputText id="dni" name="dni" value={formData.dni} onChange={handleChange} required />
            </div>

            {/* Sexo como Radio Buttons */}
            <div className="field col-12 md:col-6">
                <label htmlFor="sex">Sexo</label>
                <div className="flex flex-wrap gap-3">
                    <div className="flex align-items-center">
                        <RadioButton
                            inputId="sexM"
                            name="Sex"
                            value="M"
                            onChange={handleSexChange}
                            checked={formData.Sex === 'M'}
                            required
                        />
                        <label htmlFor="sexM" className="ml-2">Masculino</label>
                    </div>
                    <div className="flex align-items-center">
                        <RadioButton
                            inputId="sexF"
                            name="Sex"
                            value="F"
                            onChange={handleSexChange}
                            checked={formData.Sex === 'F'}
                            required
                        />
                        <label htmlFor="sexF" className="ml-2">Femenino</label>
                    </div>
                </div>
            </div>

            <div className="field col-12 md:col-6">
                <label htmlFor="dob">Fecha de Nacimiento</label>
                <Calendar id="dob" name="dob" value={formData.dob} onChange={handleDateChange} dateFormat="dd/mm/yy" showIcon />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="phone">Teléfono</label>
                <InputText id="phone" name="phone" keyfilter="pnum" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="email">Correo Electrónico</label>
                <InputText id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="address">Dirección</label>
                <InputText id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="arsID">Aseguradora ID</label>
                <InputText id="arsID" name="arsID" value={formData.arsID} onChange={handleChange} />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="PolicyID">Poliza ID</label>
                <InputText id="PolicyID" name="PolicyID" value={formData.PolicyID} onChange={handleChange} />
            </div>

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