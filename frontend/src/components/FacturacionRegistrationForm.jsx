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
    const [coverageStatus, setCoverageStatus] = useState(null); // 'Aprobada', 'Pendiente', 'Rechazada'
    const [coverageResult, setCoverageResult] = useState(null); // Guardar resultado completo

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
                const response = await fetch('https://localhost:7256/api/Tratamiento/all?Take=20', {
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
            setCoverageStatus(null); // Limpiar estado de cobertura
            setCoverageResult(null); // Limpiar resultado de cobertura
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
            setCoverageStatus(null); // Limpiar estado de cobertura
            setCoverageResult(null); // Limpiar resultado de cobertura
        }
    };

    const handleInsurerChange = (e) => {
        setFormData(prev => ({ ...prev, aseguradoraId: e.value }));
        setCoverageMessage(null); // Limpiar mensaje de cobertura al cambiar aseguradora
        setCoverageStatus(null); // Limpiar estado de cobertura
        setCoverageResult(null); // Limpiar resultado de cobertura
    };

    // Función para verificar cobertura del procedimiento
    const checkProcedureCoverage = async () => {
        if (!formData.aseguradoraId || !formData.procedimiento || !formData.cedulaPaciente || !formData.costoProcedimiento) {
            setCoverageMessage({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar un paciente, una aseguradora y un procedimiento para verificar la cobertura.'
            });
            return;
        }

        setCheckingCoverage(true);
        setCoverageMessage(null);
        setCoverageStatus(null);
        setCoverageResult(null);

        try {
            console.log(`Verificando cobertura - Paciente: ${formData.cedulaPaciente}, Aseguradora: ${formData.aseguradoraId}, Procedimiento: ${formData.procedimiento}`);

            // Obtener la descripción del procedimiento seleccionado
            const selectedProcedure = procedures.find(p => p.value === formData.procedimiento);
            const procedureDescription = selectedProcedure ? selectedProcedure.descripcion : 'PROCEDIMIENTO_MEDICO';

            // Formatear la cédula para la API (sin guiones)
            const cleanedCedula = formData.cedulaPaciente.replace(/-/g, '');

            // Preparar datos para la solicitud a la ARS
            const solicitudData = {
                tipoDocumento: "",
                numeroDocumento: cleanedCedula,
                tipoSolicitud: procedureDescription.toUpperCase(),
                descripcion: `Solicitud de cobertura para ${procedureDescription}`,
                observaciones: `Verificación de cobertura para paciente ${formData.nombrePaciente}`,
                montoSolicitud: Number(formData.costoProcedimiento)
            };

            console.log("Datos de solicitud a enviar:", solicitudData);

            // Imprimir detalles completos del request
            console.log("📤 REQUEST DETAILS:");
            console.log("   URL:", 'https://localhost:7256/api/ars/hacer-solicitud');
            console.log("   Method:", 'POST');
            console.log("   Headers:", {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            });
            console.log("   Body:", JSON.stringify(solicitudData, null, 2));

            const response = await fetch('https://localhost:7256/api/ars/hacer-solicitud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(solicitudData)
            });

            // Imprimir detalles de la respuesta
            console.log("📥 RESPONSE DETAILS:");
            console.log("   Status:", response.status);
            console.log("   Status Text:", response.statusText);
            console.log("   Headers:", Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const result = await response.json();
                console.log("   Response Body:", JSON.stringify(result, null, 2));
                console.log("Respuesta de solicitud ARS:", result);

                // Guardar el estado y resultado completo
                const estado = result.estado ? result.estado.toLowerCase() : null;
                setCoverageStatus(estado);
                setCoverageResult(result);

                // Determinar el estado de la cobertura basado en la respuesta
                if (estado === 'aprobada') {
                    const montoAprobado = result.montoAprobado || 0;
                    const porcentajeCobertura = formData.costoProcedimiento > 0
                        ? Math.round((montoAprobado / formData.costoProcedimiento) * 100)
                        : 0;

                    setCoverageMessage({
                        severity: 'success',
                        summary: 'Solicitud Aprobada',
                        detail: `✅ Solicitud ${result.numeroSolicitud} aprobada. Monto aprobado: $${montoAprobado} (${porcentajeCobertura}% de cobertura). Póliza: ${result.numeroPoliza}`
                    });
                } else if (estado === 'rechazada') {
                    setCoverageMessage({
                        severity: 'error',
                        summary: 'Solicitud Rechazada',
                        detail: `❌ Solicitud ${result.numeroSolicitud} rechazada por la ARS. Monto aprobado: $${result.montoAprobado || 0}. Póliza: ${result.numeroPoliza}. DEBE REMOVER LA ASEGURADORA para continuar.`
                    });
                } else if (estado === 'pendiente') {
                    setCoverageMessage({
                        severity: 'info',
                        summary: 'Solicitud Pendiente',
                        detail: `⏳ Solicitud ${result.numeroSolicitud} en proceso de revisión. Estado: ${result.estado}. Póliza: ${result.numeroPoliza}`
                    });
                } else {
                    setCoverageMessage({
                        severity: 'warn',
                        summary: 'Estado Desconocido',
                        detail: `Solicitud ${result.numeroSolicitud} procesada con estado: ${result.estado}. Monto aprobado: $${result.montoAprobado || 0}`
                    });
                }

                // Mostrar información adicional en consola
                console.log(`📋 Resultado de solicitud:`);
                console.log(`   - Número de solicitud: ${result.numeroSolicitud}`);
                console.log(`   - Estado: ${result.estado}`);
                console.log(`   - Monto solicitado: $${result.montoSolicitud}`);
                console.log(`   - Monto aprobado: $${result.montoAprobado}`);
                console.log(`   - Póliza: ${result.numeroPoliza}`);
                console.log(`   - Hospital: ${result.hospital}`);

            } else {
                let errorMessage = 'Error al procesar la solicitud de cobertura.';
                let errorData = null;
                try {
                    errorData = await response.json();
                    console.log("   Error Response Body:", JSON.stringify(errorData, null, 2));
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (parseError) {
                    console.log('   Error: No se pudo parsear el error response');
                }

                console.error('❌ ERROR RESPONSE:');
                console.error('   Status:', response.status);
                console.error('   Status Text:', response.statusText);
                console.error('   Error Message:', errorMessage);
                console.error('   Full Error Data:', errorData);
                setCoverageMessage({
                    severity: 'error',
                    summary: 'Error en Solicitud',
                    detail: `${errorMessage} (Código: ${response.status})`
                });
            }
        } catch (error) {
            console.error('Error al verificar cobertura:', error);
            setCoverageMessage({
                severity: 'error',
                summary: 'Error de Conexión',
                detail: 'No se pudo conectar para procesar la solicitud. Verifique su conexión.'
            });
        } finally {
            setCheckingCoverage(false);
        }
    };

    // Función para crear detalle de factura
    const createFacturaDetail = async (facturaId, tratamientoId, monto) => {
        try {
            const detalleData = {
                facturaId: Number(facturaId),
                tratamientoId: Number(tratamientoId),
                monto: Number(monto)
            };

            console.log("📤 CREANDO DETALLE DE FACTURA:");
            console.log("   URL:", 'https://localhost:7256/api/DetalleFactura');
            console.log("   Method:", 'POST');
            console.log("   Body:", JSON.stringify(detalleData, null, 2));

            const response = await fetch('https://localhost:7256/api/DetalleFactura', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(detalleData),
            });

            console.log("📥 RESPONSE DETALLE FACTURA:");
            console.log("   Status:", response.status);

            if (response.ok) {
                const result = await response.json();
                console.log("   Response Body:", JSON.stringify(result, null, 2));
                console.log("✅ Detalle de factura creado exitosamente:", result);
            } else {
                const errorData = await response.json();
                console.log("   Error Response Body:", JSON.stringify(errorData, null, 2));
                console.error("❌ Error al crear detalle de factura:", response.status, errorData);

                // Mostrar advertencia pero no bloquear el flujo principal
                setApiMessage(prev => ({
                    ...prev,
                    detail: `${prev.detail} (Advertencia: No se pudo crear el detalle de factura)`
                }));
            }
        } catch (error) {
            console.error("❌ Error de conexión al crear detalle de factura:", error);

            // Mostrar advertencia pero no bloquear el flujo principal
            setApiMessage(prev => ({
                ...prev,
                detail: `${prev.detail} (Advertencia: Error de conexión al crear detalle)`
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiMessage(null);

        // Validaciones básicas
        if (!formData.pacienteId || !formData.procedimiento || !formData.costoProcedimiento) {
            setApiMessage({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Paciente, Procedimiento y Costo son obligatorios.'
            });
            return;
        }

        // Validaciones específicas por estado de cobertura
        if (coverageStatus === 'rechazada' && formData.aseguradoraId) {
            setApiMessage({
                severity: 'error',
                summary: 'Error de Validación',
                detail: 'Debe eliminar la aseguradora ya que la solicitud fue rechazada por la ARS.'
            });
            return;
        }

        // Si hay aseguradora pero no se ha verificado la cobertura
        if (formData.aseguradoraId && !coverageStatus) {
            setApiMessage({
                severity: 'warn',
                summary: 'Verificación Requerida',
                detail: 'Debe verificar la cobertura de la aseguradora antes de registrar la factura.'
            });
            return;
        }

        setLoading(true);

        try {
            // Si el estado es Aprobada o Pendiente, usar el endpoint especial
            if ((coverageStatus === 'aprobada' || coverageStatus === 'pendiente') && formData.aseguradoraId) {
                console.log("📤 ENVIANDO A ENDPOINT ESPECIAL PARA COBERTURA:");

                const cleanedCedula = formData.cedulaPaciente.replace(/-/g, '');
                const facturaEspecialData = {
                    cedula: cleanedCedula,
                    monto: Number(formData.costoProcedimiento)
                };

                console.log("   URL:", 'https://localhost:7256/api/Factura');
                console.log("   Method:", 'POST');
                console.log("   Body:", JSON.stringify(facturaEspecialData, null, 2));

                const response = await fetch('https://localhost:7256/api/Factura', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(facturaEspecialData),
                });

                console.log("📥 RESPONSE ENDPOINT ESPECIAL:");
                console.log("   Status:", response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log("   Response Body:", JSON.stringify(result, null, 2));

                    setApiMessage({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Factura registrada exitosamente con cobertura ${coverageStatus}!`
                    });
                    console.log(`Factura registrada con cobertura:`, result);

                    // Crear detalle de factura después del registro exitoso
                    if (result && result.facturaId) {
                        await createFacturaDetail(result.facturaId, formData.procedimiento, formData.costoProcedimiento);
                    }

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
                        setCoverageStatus(null);
                        setCoverageResult(null);
                    }
                } else {
                    const errorData = await response.json();
                    console.log("   Error Response Body:", JSON.stringify(errorData, null, 2));

                    const errorMessage = errorData.message || 'Error desconocido al registrar factura con cobertura.';
                    setApiMessage({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Fallo en el registro con cobertura: ${errorMessage}`
                    });
                    console.error('Error de API con cobertura:', response.status, errorData);
                }
            } else {
                // Lógica para facturas sin cobertura
                let facturaDataToSend;
                let requestUrl = 'https://localhost:7256/api/Factura';

                if (!formData.aseguradoraId || formData.aseguradoraId === null || formData.aseguradoraId === '') {
                    // Sin aseguradora: usar estructura simplificada con cedula y monto
                    const cleanedCedula = formData.cedulaPaciente.replace(/-/g, '');
                    facturaDataToSend = {
                        cedula: cleanedCedula,
                        monto: Number(formData.costoProcedimiento)
                    };
                } else {
                    // Con aseguradora: usar estructura completa
                    facturaDataToSend = {
                        pacienteId: Number(formData.pacienteId),
                        tratamientoId: Number(formData.procedimiento),
                        monto: Number(formData.costoProcedimiento),
                        fecha: new Date().toISOString().split('T')[0],
                        aseguradoraId: Number(formData.aseguradoraId)
                    };
                }

                const method = initialData ? 'PUT' : 'POST';
                const url = initialData
                    ? `https://localhost:7256/api/Factura/${initialData.facturaId}`
                    : requestUrl;

                console.log("📤 ENVIANDO FACTURA:");
                console.log("   Tipo:", !formData.aseguradoraId ? "SIN ASEGURADORA (cedula/monto)" : "CON ASEGURADORA (estructura completa)");
                console.log("   URL:", url);
                console.log("   Method:", method);
                console.log("   Body:", JSON.stringify(facturaDataToSend, null, 2));

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

                    // Crear detalle de factura después del registro exitoso (solo para nuevas facturas)
                    if (!initialData && result && result.facturaId) {
                        await createFacturaDetail(result.facturaId, formData.procedimiento, formData.costoProcedimiento);
                    }

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
                        setCoverageStatus(null);
                        setCoverageResult(null);
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
                                disabled={proceduresLoading || coverageStatus !== null}
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
                                disabled={coverageStatus !== null}
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
                                disabled={insurersLoading || (coverageStatus === 'aprobada' || coverageStatus === 'pendiente')}
                                className={insurersError ? 'p-invalid' : ''}
                                filter
                                showClear={!(coverageStatus === 'aprobada' || coverageStatus === 'pendiente')}
                            />
                            {insurersError && <small className="p-error">{insurersError}</small>}
                        </div>

                        <div className="field col-12 md:col-4 flex align-items-end">
                            <Button
                                type="button"
                                label={checkingCoverage ? "Procesando Solicitud..." : "Verificar Cobertura"}
                                icon={checkingCoverage ? "pi pi-spin pi-spinner" : "pi pi-search"}
                                className="p-button-info"
                                onClick={checkProcedureCoverage}
                                disabled={checkingCoverage || !formData.aseguradoraId || !formData.procedimiento || !formData.cedulaPaciente || !formData.costoProcedimiento}
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
