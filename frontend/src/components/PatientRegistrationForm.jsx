import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';

export default function PatientRegistrationForm({ onPatientRegistered, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        dni: '', // Will store formatted DNI
        dob: null,
        phone: '', // Will store formatted Phone
        email: '',
        sex: null,
        address: '',
        PolicyID: '',
        arsID: '',
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [isInsured, setIsInsured] = useState(false);

    // New state for validation errors
    const [dniError, setDniError] = useState(null);
    const [phoneError, setPhoneError] = useState(null);

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

    // --- DNI Field Logic ---
    const handleDniChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        // Apply DNI format: 123-6542156-2
        if (value.length > 3) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        }
        if (value.length > 11) { // 3 (first part) + 1 (dash) + 7 (second part) + 1 (dash) = 12 characters by this point
            value = value.substring(0, 11) + '-' + value.substring(11);
        }
        
        // Ensure max length (11 digits, including dashes it becomes 13 characters)
        if (value.length > 13) {
            value = value.substring(0, 13);
        }

        setFormData(prev => ({ ...prev, dni: value }));

        // Clear error as user types
        if (dniError) setDniError(null);
    };

    // --- Phone Field Logic ---
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

        // Apply phone format: 809-654-2156
        if (value.length > 3) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        }
        if (value.length > 7) { // 3 (area code) + 1 (dash) + 3 (middle part) + 1 (dash) = 8 characters by this point
            value = value.substring(0, 7) + '-' + value.substring(7);
        }

        // Ensure max length (10 digits, including dashes it becomes 12 characters)
        if (value.length > 12) {
            value = value.substring(0, 12);
        }

        setFormData(prev => ({ ...prev, phone: value }));

        // Clear error as user types
        if (phoneError) setPhoneError(null);
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

        // Reset all specific field errors
        setDniError(null);
        setPhoneError(null);
        setApiMessage(null);

        // Basic client-side validations
        if (!formData.name || !formData.lastName || !formData.dni || !formData.sex) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, Apellido, DNI y Sexo son obligatorios.' });
            return;
        }

        // --- DNI Validation during Submission ---
        const dniRegex = /^\d{3}-\d{7}-\d{1}$/; // 123-6542156-2 (11 digits total)
        const cleanedDni = formData.dni.replace(/-/g, ''); // Remove dashes for length check
        if (!dniRegex.test(formData.dni) || cleanedDni.length !== 11) {
            setDniError('El DNI debe tener el formato 123-6542156-2 y 11 dígitos numéricos.');
            setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, corrija el formato del DNI.' });
            return;
        }

        // --- Phone Validation during Submission ---
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/; // 809-654-2156 (10 digits total)
        const cleanedPhone = formData.phone.replace(/-/g, ''); // Remove dashes for length check
        if (formData.phone && (!phoneRegex.test(formData.phone) || cleanedPhone.length !== 10)) {
            setPhoneError('El Teléfono debe tener el formato 809-654-2156 y 10 dígitos numéricos.');
            setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, corrija el formato del Teléfono.' });
            return;
        }

        // Conditional validations for arsID and PolicyID
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
            telefono: cleanedPhone, // Send cleaned phone number to API
            cedula: cleanedDni, // Send cleaned DNI to API
            email: formData.email,
            ...(isInsured && { polizaId: formData.PolicyID }),
            ...(isInsured && { aseguradoraId: formData.arsID }),
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

                // Clear the form
                setFormData({
                    name: '',
                    lastName: '',
                    dni: '',
                    dob: null,
                    phone: '',
                    email: '',
                    sex: null,
                    address: '',
                    PolicyID: '',
                    arsID: '',
                });
                setIsInsured(false);
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

            <div className="field col-12 md:col-6">
                <label htmlFor="name">Nombre</label>
                <InputText id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="lastName">Apellido</label>
                <InputText id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>

            {/* DNI Field with new handling */}
            <div className="field col-12 md:col-6">
                <label htmlFor="dni">DNI/Cédula</label>
                <InputText
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleDniChange} // Use specific handler for DNI
                    required
                    placeholder="Ej: 123-6542156-2"
                    className={dniError ? 'p-invalid' : ''} // Add p-invalid class if there's an error
                    maxLength={13} // Max length including dashes
                />
                {dniError && <small className="p-error">{dniError}</small>} {/* Display error message */}
            </div>

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

            <div className="field col-12 md:col-6">
                <label htmlFor="dob">Fecha de Nacimiento</label>
                <Calendar id="dob" name="dob" value={formData.dob} onChange={handleDateChange} dateFormat="dd/mm/yy" showIcon />
            </div>

            {/* Phone Field with new handling */}
            <div className="field col-12 md:col-6">
                <label htmlFor="phone">Teléfono</label>
                <InputText
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange} // Use specific handler for Phone
                    placeholder="Ej: 809-654-2156"
                    className={phoneError ? 'p-invalid' : ''} // Add p-invalid class if there's an error
                    maxLength={12} // Max length including dashes
                />
                {phoneError && <small className="p-error">{phoneError}</small>} {/* Display error message */}
            </div>

            <div className="field col-12 md:col-6">
                <label htmlFor="email">Correo Electrónico</label>
                <InputText id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="address">Dirección</label>
                <InputText id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>

            <div className="field col-12 flex align-items-center gap-2">
                <Checkbox
                    inputId="isInsured"
                    name="isInsured"
                    checked={isInsured}
                    onChange={handleIsInsuredChange}
                />
                <label htmlFor="isInsured" className="p-checkbox-label">Asegurado</label>
            </div>

            {isInsured && (
                <>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="arsID">Aseguradora ID</label>
                        <InputText id="arsID" name="arsID" value={formData.arsID} onChange={handleChange} required={isInsured} />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="PolicyID">Poliza ID</label>
                        <InputText id="PolicyID" name="PolicyID" value={formData.PolicyID} onChange={handleChange} required={isInsured} />
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