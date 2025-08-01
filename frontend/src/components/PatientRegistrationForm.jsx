import React, { useState, useEffect } from 'react';
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

export default function PatientRegistrationForm({ onPatientRegistered, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        dni: '',
        dob: null,
        phone: '',
        email: '',
        sex: null,
        address: '',
        PolicyID: '',
        arsID: null,
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [isInsured, setIsInsured] = useState(false);

    const [insurers, setInsurers] = useState([]);
    const [insurersLoading, setInsurersLoading] = useState(false);
    const [insurersError, setInsurersError] = useState(null);

    const [dniError, setDniError] = useState(null);
    const [phoneError, setPhoneError] = useState(null);

    const sexOptions = [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' }
    ];

    // useEffect para cargar las aseguradoras al montar el componente
    useEffect(() => {
        const fetchInsurers = async () => {
            setInsurersLoading(true);
            setInsurersError(null);
            try {
                const response = await fetch('https://localhost:5185/api/Aseguradora/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result && Array.isArray(result.data)) {
                        const formattedInsurers = result.data.map(insurer => ({
                            label: insurer.nombre,
                            value: insurer.aseguradoraId // Asegúrate que este valor sea el ID numérico
                        }));
                        setInsurers(formattedInsurers);
                        console.log("Aseguradoras cargadas y formateadas correctamente:", formattedInsurers);
                    } else {
                        setInsurersError("Formato de datos inesperado de la API. No se encontró el array de Aseguradora en 'data'.");
                        console.error("Formato inesperado de la API de aseguradoras:", result);
                        setInsurers([]);
                    }
                } else {
                    const errorData = await response.json();
                    setInsurersError(errorData.message || 'Error al cargar las aseguradoras.');
                    console.error('Error al cargar aseguradoras:', response.status, errorData);
                }
            } catch (error) {
                setInsurersError('No se pudo conectar para cargar las aseguradoras. Verifique su conexión.');
                console.error('Error de red al cargar aseguradoras:', error);
            } finally {
                setInsurersLoading(false);
            }
        };

        fetchInsurers();
    }, []);

    // useEffect para inicializar el formulario si hay datos iniciales (para edición)
    useEffect(() => {
        const formatDniForForm = (dni) => {
            if (!dni) return '';
            const cleaned = String(dni).replace(/\D/g, '');
            if (cleaned.length === 11) {
                return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 10)}-${cleaned.substring(10, 11)}`;
            }
            return String(dni);
        };

        const formatPhoneForForm = (phone) => {
            if (!phone) return '';
            const cleaned = String(phone).replace(/\D/g, '');
            if (cleaned.length === 10) {
                return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
            }
            return String(phone);
        };

        if (initialData) {
            console.log("Datos iniciales (initialData):", initialData);
            console.log("Tipo de initialData.aseguradoraId:", typeof initialData.aseguradoraId, "Valor:", initialData.aseguradoraId);

            // Asegurarse de que el arsID sea un número si no es null
            let initialArsId = initialData.aseguradoraId !== null && initialData.aseguradoraId !== undefined
                ? Number(initialData.aseguradoraId)
                : null;

            // Debugging: Verificar si el initialArsId existe en la lista de aseguradoras cargadas
            if (initialArsId !== null && insurers.length > 0) {
                const foundInsurer = insurers.find(insurer => insurer.value === initialArsId);
                if (!foundInsurer) {
                    console.warn(`Aseguradora con ID ${initialArsId} de initialData no encontrada en la lista de aseguradoras cargadas.`);
                    // Opcional: Si el ID no se encuentra, puedes decidir resetearlo a null
                    // initialArsId = null; 
                } else {
                    console.log(`Aseguradora encontrada en la lista:`, foundInsurer);
                }
            } else if (initialArsId !== null && insurersLoading) {
                console.log("Aseguradoras aún cargando, se intentará establecer arsID cuando estén disponibles.");
            }

            setFormData({
                name: initialData.nombre || '',
                lastName: initialData.apellido || '',
                dni: formatDniForForm(initialData.cedula) || '',
                dob: initialData.fechaNacimiento ? new Date(initialData.fechaNacimiento) : null,
                phone: formatPhoneForForm(initialData.telefono) || '',
                email: initialData.email || '',
                sex: initialData.sexo || null,
                address: initialData.direccion || '',
                PolicyID: initialData.polizaId || '',
                arsID: initialArsId, // Usar el ID procesado
            });
            // Activar isInsured si hay datos de póliza o aseguradora
            setIsInsured(!!initialData.polizaId || (initialData.aseguradoraId !== null && initialData.aseguradoraId !== undefined));
        } else {
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
                arsID: null,
            });
            setIsInsured(false);
        }
    }, [initialData, insurers, insurersLoading]); // Añade 'insurersLoading' como dependencia para mejor reactividad

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

    const handleInsurerChange = (e) => {
        setFormData(prev => ({ ...prev, arsID: e.value }));
    };

    const handleDniChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.substring(0, 3) + '-' + value.substring(3);
        if (value.length > 11) value = value.substring(0, 11) + '-' + value.substring(11);
        if (value.length > 13) value = value.substring(0, 13);
        setFormData(prev => ({ ...prev, dni: value }));
        if (dniError) setDniError(null);
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.substring(0, 3) + '-' + value.substring(3);
        if (value.length > 7) value = value.substring(0, 7) + '-' + value.substring(7);
        if (value.length > 12) value = value.substring(0, 12);
        setFormData(prev => ({ ...prev, phone: value }));
        if (phoneError) setPhoneError(null);
    };

    const handleIsInsuredChange = (e) => {
        const checked = e.checked;
        setIsInsured(checked);
        if (!checked) {
            setFormData(prev => ({ ...prev, PolicyID: '', arsID: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setDniError(null);
        setPhoneError(null);
        setApiMessage(null);

        if (!formData.name || !formData.lastName || !formData.dni || !formData.sex) {
            setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, Apellido, DNI y Sexo son obligatorios.' });
            return;
        }

        const dniRegex = /^\d{3}-\d{7}-\d{1}$/;
        const cleanedDni = formData.dni.replace(/-/g, '');
        if (!dniRegex.test(formData.dni) || cleanedDni.length !== 11) {
            setDniError('El DNI debe tener el formato 123-4567890-2 y 11 dígitos numéricos.');
            setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, corrija el formato del DNI.' });
            return;
        }

        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        const cleanedPhone = formData.phone.replace(/-/g, '');
        if (formData.phone && (!phoneRegex.test(formData.phone) || cleanedPhone.length !== 10)) {
            setPhoneError('El Teléfono debe tener el formato 809-654-2156 y 10 dígitos numéricos.');
            setApiMessage({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, corrija el formato del Teléfono.' });
            return;
        }

        if (isInsured) {
            if (formData.arsID === null || formData.PolicyID === '') {
                setApiMessage({ severity: 'warn', summary: 'Advertencia', detail: 'Si el paciente está asegurado, Aseguradora y Póliza ID son obligatorios.' });
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
            telefono: cleanedPhone,
            cedula: cleanedDni,
            email: formData.email,
            // Solo incluir polizaId y aseguradoraId si isInsured es true
            ...(isInsured && { polizaId: formData.PolicyID }),
            ...(isInsured && { aseguradoraId: formData.arsID }),
        };

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData
            ? `http://localhost:5185//api/Paciente/${initialData.pacienteId}`
            : 'http://localhost:5185//api/Paciente';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(patientDataToSend),
            });

            if (response.ok) {
                const result = await response.json();
                setApiMessage({ severity: 'success', summary: 'Éxito', detail: `Paciente ${initialData ? 'actualizado' : 'registrado'} exitosamente!` });
                console.log(`Paciente ${initialData ? 'actualizado' : 'registrado'}:`, result);

                onPatientRegistered(result);

                if (!initialData) {
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
                        arsID: null,
                    });
                    setIsInsured(false);
                }
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Error desconocido al ${initialData ? 'actualizar' : 'registrar'} paciente.`;
                setApiMessage({ severity: 'error', summary: 'Error', detail: `Fallo en el ${initialData ? 'actualización' : 'registro'}: ${errorMessage}` });
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
                <InputText
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan"
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="lastName">Apellido</label>
                <InputText
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Pérez"
                />
            </div>

            <div className="field col-12 md:col-6">
                <label htmlFor="dni">DNI/Cédula</label>
                <InputText
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleDniChange}
                    required
                    placeholder="Ej: 123-4567890-2"
                    className={dniError ? 'p-invalid' : ''}
                    maxLength={13}
                />
                {dniError && <small className="p-error">{dniError}</small>}
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

            <div className="field col-12 md:col-6">
                <label htmlFor="phone">Teléfono</label>
                <InputText
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="Ej: 809-654-2156"
                    className={phoneError ? 'p-invalid' : ''}
                    maxLength={12}
                />
                {phoneError && <small className="p-error">{phoneError}</small>}
            </div>

            <div className="field col-12 md:col-6">
                <label htmlFor="email">Correo Electrónico</label>
                <InputText
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@dominio.com"
                />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="address">Dirección</label>
                <InputText
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ej: Calle Principal #123, Sector Centro"
                />
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
                        <label htmlFor="arsID">Aseguradora</label>
                        <Dropdown
                            id="arsID"
                            name="arsID"
                            value={formData.arsID}
                            options={insurers}
                            onChange={handleInsurerChange}
                            placeholder={insurersLoading ? "Cargando aseguradoras..." : "Seleccione una aseguradora"}
                            optionLabel="label"
                            optionValue="value"
                            required={isInsured}
                            disabled={insurersLoading}
                            className={insurersError ? 'p-invalid' : ''}
                        />
                        {insurersError && <small className="p-error">{insurersError}</small>}
                        {insurersLoading && <small>Cargando aseguradoras...</small>}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="PolicyID">Póliza ID</label>
                        <InputText id="PolicyID" name="PolicyID" value={formData.PolicyID} onChange={handleChange} required={isInsured} />
                    </div>
                </>
            )}

            <div className="col-12 flex justify-content-end gap-2 mt-4">
                {/* <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} disabled={loading} /> */}
                <Button
                    type="submit"
                    label={loading ? (initialData ? "Actualizando..." : "Registrando...") : (initialData ? "Actualizar Paciente" : "Registrar Paciente")}
                    // icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    disabled={loading}
                />
            </div>
        </form>
    );
}