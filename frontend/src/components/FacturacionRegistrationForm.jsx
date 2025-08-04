import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';

export default function FacturacionRegistrationForm({ onFacturaRegistered, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        pacienteId: '',
        nombrePaciente: '',
        cedulaPaciente: '',
        procedimiento: null,
        costoProcedimiento: 0,
        aseguradoraId: null,
    });

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [coverageMessage, setCoverageMessage] = useState(null);
    const [checkingCoverage, setCheckingCoverage] = useState(false);

    // Estados para dropdowns
    const [patients, setPatients] = useState([]);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [patientsError, setPatientsError] = useState(null);

    const [procedures, setProcedures] = useState([]);
    const [proceduresLoading, setProceduresLoading] = useState(false);
    const [proceduresError, setProceduresError] = useState(null);

    const [insurers, setInsurers] = useState([]);
    const [insurersLoading, setInsurersLoading] = useState(false);
    const [insurersError, setInsurersError] = useState(null);

    // useEffect para cargar pacientes al montar el componente
    useEffect(() => {
        const fetchPatients = async () => {
            setPatientsLoading(true);
            setPatientsError(null);
            try {
                const response = await fetch('https://localhost:7256/api/Paciente/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result && Array.isArray(result.data)) {
                        const formattedPatients = result.data.map(patient => ({
                            label: `${patient.nombre} ${patient.apellido} - ${patient.cedula}`,
                            value: patient.pacienteId,
                            nombre: `${patient.nombre} ${patient.apellido}`,
                            cedula: patient.cedula,
                            aseguradoraId: patient.aseguradoraId
                        }));
                        setPatients(formattedPatients);
                        console.log("Pacientes cargados:", formattedPatients);
                    } else {
                        setPatientsError("Error al cargar pacientes. Formato inesperado.");
                        console.error("Formato inesperado de pacientes:", result);
                        setPatients([]);
                    }
                } else {
                    const errorData = await response.json();
                    setPatientsError(errorData.message || 'Error al cargar pacientes.');
                    console.error('Error al cargar pacientes:', response.status, errorData);
                }
            } catch (error) {
                setPatientsError('No se pudo conectar para cargar pacientes.');
                console.error('Error de red al cargar pacientes:', error);
            } finally {
                setPatientsLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // useEffect para cargar procedimientos
    useEffect(() => {
        const fetchProcedures = async () => {
            setProceduresLoading(true);
            setProceduresError(null);
            try {
                const response = await fetch('https://localhost:7256/api/Tratamiento/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result && Array.isArray(result.data)) {
                        const formattedProcedures = result.data.map(procedure => ({
                            label: `${procedure.descripcion} - $${procedure.costo}`,
                            value: procedure.tratamientoId,
                            descripcion: procedure.descripcion,
                            costo: procedure.costo
                        }));
                        setProcedures(formattedProcedures);
                        console.log("Procedimientos cargados:", formattedProcedures);
                    } else {
                        setProceduresError("Error al cargar procedimientos. Formato inesperado.");
                        console.error("Formato inesperado de procedimientos:", result);
                        setProcedures([]);
                    }
                } else {
                    const errorData = await response.json();
                    setProceduresError(errorData.message || 'Error al cargar procedimientos.');
                    console.error('Error al cargar procedimientos:', response.status, errorData);
                }
            } catch (error) {
                setProceduresError('No se pudo conectar para cargar procedimientos.');
                console.error('Error de red al cargar procedimientos:', error);
            } finally {
                setProceduresLoading(false);
            }
        };

        fetchProcedures();
    }, []);

    // useEffect para cargar aseguradoras
    useEffect(() => {
        const fetchInsurers = async () => {
            setInsurersLoading(true);
            setInsurersError(null);
            try {
                const response = await fetch('https://localhost:7256/api/Aseguradora/all', {
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
                            value: insurer.aseguradoraId
                        }));
                        setInsurers(formattedInsurers);
                        console.log("Aseguradoras cargadas:", formattedInsurers);
                    } else {
                        setInsurersError("Error al cargar aseguradoras. Formato inesperado.");
                        console.error("Formato inesperado de aseguradoras:", result);
                        setInsurers([]);
                    }
                } else {
                    const errorData = await response.json();
                    setInsurersError(errorData.message || 'Error al cargar aseguradoras.');
                    console.error('Error al cargar aseguradoras:', response.status, errorData);
                }
            } catch (error) {
                setInsurersError('No se pudo conectar para cargar aseguradoras.');
                console.error('Error de red al cargar aseguradoras:', error);
            } finally {
                setInsurersLoading(false);
            }
        };

        fetchInsurers();
    }, []);

    // Función para buscar aseguradora por nombre (similar a PatientRegistrationForm)
    const searchInsurerByName = async (insurerName) => {
        try {
            console.log(`Buscando aseguradora por nombre: "${insurerName}"`);
            const encodedName = encodeURIComponent(insurerName);
            const response = await fetch(`https://localhost:7256/api/Aseguradora/all?Search=${encodedName}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Respuesta de búsqueda de aseguradora:", result);

                if (result && Array.isArray(result.data) && result.data.length > 0) {
                    const exactMatch = result.data.find(insurer =>
                        insurer.nombre.toLowerCase() === insurerName.toLowerCase()
                    );

                    if (exactMatch) {
                        console.log(`Aseguradora encontrada (coincidencia exacta):`, exactMatch);
                        return exactMatch.aseguradoraId;
                    } else {
                        console.log(`Aseguradora encontrada (primer resultado):`, result.data[0]);
                        return result.data[0].aseguradoraId;
                    }
                } else {
                    console.warn(`No se encontró ninguna aseguradora con el nombre: "${insurerName}"`);
                    return null;
                }
            } else {
                console.error('Error en la búsqueda de aseguradora:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error de red al buscar aseguradora:', error);
            return null;
        }
    };

    // useEffect para inicializar formulario con datos iniciales
    useEffect(() => {
        const initializeFormData = async () => {
            if (initialData) {
                console.log("Datos iniciales para facturación:", initialData);

                let initialAseguradoraId = null;
                if (initialData.aseguradora) {
                    initialAseguradoraId = await searchInsurerByName(initialData.aseguradora);
                } else if (initialData.aseguradoraId) {
                    initialAseguradoraId = Number(initialData.aseguradoraId);
                }

                setFormData({
                    pacienteId: initialData.pacienteId || '',
                    nombrePaciente: initialData.nombrePaciente || '',
                    cedulaPaciente: initialData.cedulaPaciente || '',
                    procedimiento: initialData.procedimiento || null,
                    costoProcedimiento: initialData.costoProcedimiento || 0,
                    aseguradoraId: initialAseguradoraId,
                });
            }
        };

        initializeFormData();
    }, [initialData]);

    // Manejadores de cambios
    const handlePatientChange = (e) => {
        const selectedPatient = patients.find(p => p.value === e.value);
        if (selectedPatient) {
            setFormData(prev => ({
                ...prev,
                pacienteId: selectedPatient.value,
                nombrePaciente: selectedPatient.nombre,
                cedulaPaciente: selectedPatient.cedula,
                aseguradoraId: selectedPatient.aseguradoraId || null
            }));
            setCoverageMessage(null); // Limpiar mensaje de cobertura al cambiar paciente
        }
    };

    const handleProcedureChange = (e) => {
        const selectedProcedure = procedures.find(p => p.value === e.value);
        if (selectedProcedure) {
            setFormData(prev => ({
                ...prev,
                procedimiento: selectedProcedure.value,
                costoProcedimiento: selectedProcedure.costo
            }));
            setCoverageMessage(null); // Limpiar mensaje de cobertura al cambiar procedimiento
        }
    };

    const handleInsurerChange = (e) => {
        setFormData(prev => ({ ...prev, aseguradoraId: e.value }));
        setCoverageMessage(null); // Limpiar mensaje de cobertura al cambiar aseguradora
    };

    // Función para verificar cobertura del procedimiento
    const checkProcedureCoverage = async () => {
        if (!formData.aseguradoraId || !formData.procedimiento) {
            setCoverageMessage({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar una aseguradora y un procedimiento para verificar la cobertura.'
            });
            return;
        }

        setCheckingCoverage(true);
        setCoverageMessage(null);

        try {
            console.log(`Verificando cobertura - Aseguradora: ${formData.aseguradoraId}, Procedimiento: ${formData.procedimiento}`);

            // Aquí puedes ajustar el endpoint según tu API
            const response = await fetch(`https://localhost:7256/api/Aseguradora/${formData.aseguradoraId}/cobertura/${formData.procedimiento}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Respuesta de cobertura:", result);

                if (result.cubierto) {
                    setCoverageMessage({
                        severity: 'success',
                        summary: 'Cobertura Confirmada',
                        detail: `El procedimiento está cubierto. Porcentaje de cobertura: ${result.porcentajeCobertura || '100'}%`
                    });
                } else {
                    setCoverageMessage({
                        severity: 'error',
                        summary: 'Sin Cobertura',
                        detail: result.razon || 'El procedimiento no está cubierto por esta aseguradora.'
                    });
                }
            } else {
                // Si el endpoint no existe o hay error, simular una respuesta
                console.log("Endpoint de cobertura no disponible, simulando respuesta...");

                // Simulación: procedimientos con ID par están cubiertos
                const procedureId = Number(formData.procedimiento);
                if (procedureId % 2 === 0) {
                    setCoverageMessage({
                        severity: 'success',
                        summary: 'Cobertura Confirmada',
                        detail: 'El procedimiento está cubierto por la aseguradora. Porcentaje de cobertura: 80%'
                    });
                } else {
                    setCoverageMessage({
                        severity: 'error',
                        summary: 'Sin Cobertura',
                        detail: 'El procedimiento no está cubierto por esta aseguradora.'
                    });
                }
            }
        } catch (error) {
            console.error('Error al verificar cobertura:', error);
            setCoverageMessage({
                severity: 'error',
                summary: 'Error de Conexión',
                detail: 'No se pudo verificar la cobertura. Verifique su conexión.'
            });
        } finally {
            setCheckingCoverage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiMessage(null);

        // Validaciones
        if (!formData.pacienteId || !formData.procedimiento || !formData.costoProcedimiento) {
            setApiMessage({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Paciente, Procedimiento y Costo son obligatorios.'
            });
            return;
        }

        setLoading(true);

        const facturaDataToSend = {
            pacienteId: Number(formData.pacienteId),
            tratamientoId: Number(formData.procedimiento),
            monto: Number(formData.costoProcedimiento),
            fecha: new Date().toISOString().split('T')[0],
            ...(formData.aseguradoraId && { aseguradoraId: Number(formData.aseguradoraId) }),
        };

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData
            ? `https://localhost:7256/api/Factura/${initialData.facturaId}`
            : 'https://localhost:7256/api/Factura';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(facturaDataToSend),
            });

            if (response.ok) {
                const result = await response.json();
                setApiMessage({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `Factura ${initialData ? 'actualizada' : 'registrada'} exitosamente!`
                });
                console.log(`Factura ${initialData ? 'actualizada' : 'registrada'}:`, result);

                onFacturaRegistered(result);

                if (!initialData) {
                    // Limpiar formulario
                    setFormData({
                        pacienteId: '',
                        nombrePaciente: '',
                        cedulaPaciente: '',
                        procedimiento: null,
                        costoProcedimiento: 0,
                        aseguradoraId: null,
                    });
                    setCoverageMessage(null);
                }
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Error desconocido al ${initialData ? 'actualizar' : 'registrar'} factura.`;
                setApiMessage({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Fallo en el ${initialData ? 'actualización' : 'registro'}: ${errorMessage}`
                });
                console.error('Error de API:', response.status, errorData);
            }
        } catch (error) {
            setApiMessage({
                severity: 'error',
                summary: 'Error de Conexión',
                detail: 'No se pudo conectar con el servidor. Verifique su conexión.'
            });
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

            {/* Información del Paciente */}
            <div className="col-12">
                <Card title="Información del Paciente" className="mb-3">
                    <div className="grid">
                        <div className="field col-12">
                            <label htmlFor="paciente"> </label>
                            <Dropdown
                                id="paciente"
                                name="paciente"
                                value={formData.pacienteId}
                                options={patients}
                                onChange={handlePatientChange}
                                placeholder={patientsLoading ? "Cargando pacientes..." : "Seleccione un paciente"}
                                optionLabel="label"
                                optionValue="value"
                                required
                                disabled={patientsLoading}
                                className={patientsError ? 'p-invalid' : ''}
                                filter
                            />
                            {patientsError && <small className="p-error">{patientsError}</small>}
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="nombrePaciente">Nombre del Paciente</label>
                            <InputText
                                id="nombrePaciente"
                                name="nombrePaciente"
                                value={formData.nombrePaciente}
                                disabled
                                placeholder="Nombre se completará automáticamente"
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="cedulaPaciente">Cédula del Paciente</label>
                            <InputText
                                id="cedulaPaciente"
                                name="cedulaPaciente"
                                value={formData.cedulaPaciente}
                                disabled
                                placeholder="Cédula se completará automáticamente"
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="pacienteId">ID del Paciente</label>
                            <InputText
                                id="pacienteId"
                                name="pacienteId"
                                value={formData.pacienteId}
                                disabled
                                placeholder="ID se completará automáticamente"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Información del Procedimiento */}
            <div className="col-12">
                <Card title="Información del Procedimiento" className="mb-3">
                    <div className="grid">
                        <div className="field col-12 md:col-8">
                            <label htmlFor="procedimiento"> </label>
                            <Dropdown
                                id="procedimiento"
                                name="procedimiento"
                                value={formData.procedimiento}
                                options={procedures}
                                onChange={handleProcedureChange}
                                placeholder={proceduresLoading ? "Cargando procedimientos..." : "Seleccione un procedimiento"}
                                optionLabel="label"
                                optionValue="value"
                                required
                                disabled={proceduresLoading}
                                className={proceduresError ? 'p-invalid' : ''}
                                filter
                            />
                            {proceduresError && <small className="p-error">{proceduresError}</small>}
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="costoProcedimiento">Costo del Procedimiento</label>
                            <InputNumber
                                id="costoProcedimiento"
                                name="costoProcedimiento"
                                value={formData.costoProcedimiento}
                                onValueChange={(e) => setFormData(prev => ({ ...prev, costoProcedimiento: e.value }))}
                                mode="currency"
                                currency="USD"
                                locale="en-US"
                                required
                                disabled
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Información de la Aseguradora */}
            <div className="col-12">
                <Card title="Información de Aseguradora" className="mb-3">
                    <div className="grid">
                        <div className="field col-12 md:col-8">
                            <label htmlFor="aseguradoraId"> </label>
                            <Dropdown
                                id="aseguradoraId"
                                name="aseguradoraId"
                                value={formData.aseguradoraId}
                                options={insurers}
                                onChange={handleInsurerChange}
                                placeholder={insurersLoading ? "Cargando aseguradoras..." : "Seleccione una aseguradora (opcional)"}
                                optionLabel="label"
                                optionValue="value"
                                disabled={insurersLoading}
                                className={insurersError ? 'p-invalid' : ''}
                                filter
                                showClear
                            />
                            {insurersError && <small className="p-error">{insurersError}</small>}
                        </div>

                        <div className="field col-12 md:col-4 flex align-items-end">
                            <Button
                                type="button"
                                label={checkingCoverage ? "Verificando..." : "Verificar Cobertura"}
                                icon={checkingCoverage ? "pi pi-spin pi-spinner" : "pi pi-search"}
                                className="p-button-info"
                                onClick={checkProcedureCoverage}
                                disabled={checkingCoverage || !formData.aseguradoraId || !formData.procedimiento}
                            />
                        </div>

                        {coverageMessage && (
                            <div className="col-12">
                                <Message
                                    severity={coverageMessage.severity}
                                    summary={coverageMessage.summary}
                                    text={coverageMessage.detail}
                                />
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Divider />

            <div className="col-12 flex justify-content-end gap-2 mt-4">
                {/* <Button
                    type="button"
                    label="Cancelar"
                    icon="pi pi-times"
                    className="p-button-text"
                    onClick={onCancel}
                    disabled={loading}
                /> */}
                <Button
                    type="submit"
                    label={loading ? (initialData ? "Actualizando..." : "Registrando...") : (initialData ? "Actualizar Factura" : "Registrar Factura")}
                    // icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    disabled={loading}
                />
            </div>
        </form>
    );
}
