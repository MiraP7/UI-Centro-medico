import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputMask } from 'primereact/inputmask';

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
        Sex: null, // Initialize to null for dropdown to show placeholder
        address: '',
        PolicyID: '',
        arsID: '',
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [isInsured, setIsInsured] = useState(false); // State for the "Asegurado" checkbox

    // Define the options for the Sex dropdown
    const sexOptions = [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        setFormData(prev => ({ ...prev, dob: e.value }));
    };

    // Handler for the Dropdown component
    const handleSexChange = (e) => {
        setFormData(prev => ({ ...prev, Sex: e.value }));
    };

    // Handler for the Checkbox component
    const handleInsuredChange = (e) => {
        setIsInsured(e.checked);
        // When checkbox is unchecked, clear PolicyID and arsID for safety
        if (!e.checked) {
            setFormData(prev => ({ ...prev, PolicyID: '', arsID: '' }));
        }
    };

    // Handler to set cursor position to the beginning on focus
    const handleFocus = (e) => {
        // Only set cursor to 0,0 if the input value is empty or primarily composed of mask characters
        // This is particularly important for InputMask where '0' might be a valid starting char
        if (!e.target.value || e.target.value.replace(/[^a-zA-Z0-9]/g, '') === '') {
            setTimeout(() => { // Use setTimeout to ensure this runs after InputMask's internal logic
                e.target.setSelectionRange(0, 0);
            }, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic client-side validations
        if (!formData.name || !formData.lastName || !formData.dni || !formData.Sex) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, Apellido, DNI y Sexo son obligatorios.' });
            return;
        }

        // Validate PolicyID and arsID only if isInsured is true
        if (isInsured && (!formData.PolicyID || !formData.arsID)) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'ID de Póliza y ID de Aseguradora son obligatorios para pacientes asegurados.' });
            return;
        }

        setLoading(true);
        setApiMessage(null);

        const formattedDob = formData.dob ? formData.dob.toISOString().split('T')[0] : null;

        const patientDataToSend = {
            nombre: formData.name,
            apellido: formData.lastName,
            fechaNacimiento: formattedDob,
            sexo: formData.Sex, // 'M' or 'F' selected from dropdown
            direccion: formData.address,
            telefono: formData.phone,
            cedula: formData.dni,
            email: formData.email,
            // Only send PolicyID and arsID if the patient is insured
            polizaId: isInsured ? formData.PolicyID : null, // Send null or undefined if not insured
            aseguradoraId: isInsured ? formData.arsID : null, // Send null or undefined if not insured
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
                    Sex: null, // Reset Sex field to null for dropdown
                    address: '',
                    PolicyID: '',
                    arsID: '',
                });
                setIsInsured(false); // Reset insured checkbox
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
                <label htmlFor="name" style={{ fontWeight: 'bold' }}>Nombre</label>
                <InputText id="name" name="name" value={formData.name} onChange={handleChange} onFocus={handleFocus} required />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="lastName" style={{ fontWeight: 'bold' }}>Apellido</label>
                <InputText id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} onFocus={handleFocus} required />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="dni" style={{ fontWeight: 'bold' }}>DNI/Cédula</label>
                <InputMask
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    mask="999-9999999-9" // Dominican Republic Cédula format
                    placeholder="999-9999999-9"
                    onFocus={handleFocus} // Add onFocus handler here
                    required
                />
            </div>

            {/* Sexo como Dropdown */}
            <div className="field col-12 md:col-6">
                <label htmlFor="Sex" style={{ fontWeight: 'bold' }}>Sexo</label>
                <Dropdown
                    id="Sex"
                    name="Sex"
                    value={formData.Sex}
                    options={sexOptions}
                    onChange={handleSexChange}
                    placeholder="Seleccione un sexo"
                    required
                />
            </div>

            <div className="field col-12 md:col-6">
                <label htmlFor="dob" style={{ fontWeight: 'bold' }}>Fecha de Nacimiento</label>
                <Calendar id="dob" name="dob" value={formData.dob} onChange={handleDateChange} dateFormat="dd/mm/yy" showIcon />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="phone" style={{ fontWeight: 'bold' }}>Teléfono</label>
                <InputMask
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    mask="(999) 999-9999" // Common phone format for Dominican Republic
                    placeholder="(999) 999-9999"
                    onFocus={handleFocus} // Add onFocus handler here
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="email" style={{ fontWeight: 'bold' }}>Correo Electrónico</label>
                <InputText id="email" name="email" type="email" value={formData.email} onChange={handleChange} onFocus={handleFocus} />
            </div>
            <div className="field col-12"> {/* Full width for address */}
                <label htmlFor="address" style={{ fontWeight: 'bold' }}>Dirección</label>
                <InputText id="address" name="address" value={formData.address} onChange={handleChange} onFocus={handleFocus} />
            </div>

            {/* Asegurado Checkbox */}
            <div className="field col-12 mt-3">
                <div className="flex align-items-center">
                    <Checkbox
                        inputId="isInsured"
                        name="isInsured"
                        onChange={handleInsuredChange}
                        checked={isInsured}
                    />
                    <label htmlFor="isInsured" className="ml-2" style={{ fontWeight: 'bold' }}>Asegurado</label>
                </div>
            </div>

            {/* Conditional Rendering for PolicyID and ArsID fields */}
            {isInsured && (
                <>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="arsID" style={{ fontWeight: 'bold' }}>Aseguradora ID</label>
                        <InputText
                            id="arsID"
                            name="arsID"
                            value={formData.arsID}
                            onChange={handleChange}
                            onFocus={handleFocus} // Add onFocus handler here
                            required={isInsured} // Still required when visible
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="PolicyID" style={{ fontWeight: 'bold' }}>Poliza ID</label>
                        <InputText
                            id="PolicyID"
                            name="PolicyID"
                            value={formData.PolicyID}
                            onChange={handleChange}
                            onFocus={handleFocus} // Add onFocus handler here
                            required={isInsured} // Still required when visible
                        />
                    </div>
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