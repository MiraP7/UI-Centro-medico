import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import PatientRegistrationForm from './PatientRegistrationForm';
import CitaService from '../Services/CitaService';

const citaService = new CitaService(); // Crear instancia del servicio

export default function AppointmentRegistrationForm({
    appointmentToEdit = null,
    onAppointmentRegistered,
    onCancel
}) {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedMedico, setSelectedMedico] = useState(null);
    const [appointmentDate, setAppointmentDate] = useState(null);
    const [appointmentTime, setAppointmentTime] = useState('');
    const [selectedTreatment, setSelectedTreatment] = useState(null); // Cambiado de reason a selectedTreatment
    const [patients, setPatients] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [treatments, setTreatments] = useState([]); // Nuevo estado para tratamientos
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingMedicos, setLoadingMedicos] = useState(false);
    const [loadingTreatments, setLoadingTreatments] = useState(false); // Nuevo estado de carga

    const [showPatientRegistrationModal, setShowPatientRegistrationModal] = useState(false);

    // Determinar si estamos en modo edición
    const isEditMode = appointmentToEdit !== null;

    const timeSlots = [
        { label: '09:00 AM', value: '09:00 AM' }, { label: '09:30 AM', value: '09:30 AM' },
        { label: '10:00 AM', value: '10:00 AM' }, { label: '10:30 AM', value: '10:30 AM' },
        { label: '11:00 AM', value: '11:00 AM' }, { label: '11:30 AM', value: '11:30 AM' },
    ];

    // Efecto para pre-llenar campos cuando está en modo edición
    useEffect(() => {
        if (isEditMode && appointmentToEdit) {
            console.log('🔄 Modo edición activado. Datos recibidos:', appointmentToEdit);

            // Pre-llenar campos con los datos de la cita a editar
            if (appointmentToEdit.pacienteId || appointmentToEdit.pacienteID) {
                const patientId = (appointmentToEdit.pacienteId || appointmentToEdit.pacienteID).toString();
                console.log('👤 Configurando paciente ID:', patientId);
                setSelectedPatient(patientId);
            }

            // Manejar la fecha - puede venir como fechaHora o date
            if (appointmentToEdit.fechaHora || appointmentToEdit.date) {
                const dateValue = appointmentToEdit.fechaHora || appointmentToEdit.date;
                console.log('📅 Configurando fecha:', dateValue);
                setAppointmentDate(new Date(dateValue));
            }

            // Manejar la hora
            if (appointmentToEdit.time || appointmentToEdit.hora) {
                const timeValue = appointmentToEdit.time || appointmentToEdit.hora;
                console.log('🕐 Configurando hora:', timeValue);
                setAppointmentTime(timeValue);
            }

            // Manejar el tratamiento - buscar por tratamientoId o descripción
            if (appointmentToEdit.tratamientoId) {
                const treatmentId = appointmentToEdit.tratamientoId.toString();
                console.log('🏥 Configurando tratamiento ID:', treatmentId);
                setSelectedTreatment(treatmentId);
            } else if (appointmentToEdit.motivoConsulta || appointmentToEdit.reason) {
                // Si no hay tratamientoId, buscar por descripción cuando los tratamientos estén cargados
                const reasonValue = appointmentToEdit.motivoConsulta || appointmentToEdit.reason;
                console.log('📝 Tratamiento por descripción:', reasonValue);
                // Esto se manejará en un useEffect separado cuando los tratamientos estén cargados
                setSelectedTreatment(reasonValue);
            }

            // Pre-llenar médico si existe
            if (appointmentToEdit.medicoId || appointmentToEdit.medicoID) {
                const medicoId = (appointmentToEdit.medicoId || appointmentToEdit.medicoID).toString();
                console.log('👨‍⚕️ Configurando médico ID:', medicoId);
                setSelectedMedico(medicoId);
            }

            console.log('✅ Campos configurados para edición');
        } else {
            console.log('🆕 Modo creación - limpiando campos');
            // Limpiar campos en modo creación
            setSelectedPatient(null);
            setSelectedMedico(null);
            setAppointmentDate(null);
            setAppointmentTime('');
            setSelectedTreatment(null);
        }
    }, [isEditMode, appointmentToEdit]);

    // Función para cargar tratamientos desde la API
    const loadTreatments = async () => {
        try {
            console.log('🔄 Iniciando carga de tratamientos...');
            setLoadingTreatments(true);

            const response = await fetch('https://localhost:44388/api/Tratamiento/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('📊 Datos de tratamientos recibidos:', result);

                // Verificar si hay datos
                if (!result || !Array.isArray(result.data)) {
                    console.warn('⚠️ Los datos de tratamientos no son un array válido:', result);
                    setTreatments([]);
                    return;
                }

                // Transformar los datos para el formato del Dropdown
                const formattedTreatments = result.data.map(treatment => {
                    console.log('🔄 Procesando tratamiento:', treatment);

                    const treatmentId = treatment.tratamientoId || treatment.id;

                    if (!treatmentId) {
                        console.warn('⚠️ Tratamiento sin ID válido:', treatment);
                        return null;
                    }

                    return {
                        label: `${treatment.descripcion} - $${treatment.costo}`,
                        value: treatmentId.toString(),
                        descripcion: treatment.descripcion,
                        costo: treatment.costo
                    };
                }).filter(treatment => treatment !== null);

                console.log('✅ Tratamientos formateados:', formattedTreatments);
                setTreatments(formattedTreatments);

                if (formattedTreatments.length === 0) {
                    console.warn('⚠️ No se pudieron formatear tratamientos válidos');
                }
            } else {
                const errorData = await response.json();
                console.error('❌ Error de API al cargar tratamientos:', response.status, errorData);
                setTreatments([]);
            }
        } catch (error) {
            console.error('❌ Error al cargar tratamientos:', error);
            console.error('❌ Detalles del error:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            setTreatments([]);
        } finally {
            setLoadingTreatments(false);
        }
    };

    // Función para cargar pacientes desde la API
    const loadPatients = async () => {
        try {
            console.log('🔄 Iniciando carga de pacientes...');
            setLoadingPatients(true);
            const patientsData = await citaService.getAllPacientes();
            console.log('📊 Datos de pacientes recibidos:', patientsData);

            // Verificar si hay datos
            if (!patientsData || !Array.isArray(patientsData)) {
                console.warn('⚠️ Los datos de pacientes no son un array válido:', patientsData);
                setPatients([]);
                return;
            }

            // Transformar los datos para el formato del Dropdown
            const formattedPatients = patientsData.map(patient => {
                console.log('🔄 Procesando paciente:', patient);

                // Manejar diferentes formatos de ID (pacienteId vs pacienteID)
                const patientId = patient.pacienteId || patient.pacienteID || patient.id;

                // Manejar diferentes formatos de cédula
                const cedula = patient.cedula || patient.numeroIdentificacion || patient.cedulaIdentidad || 'Sin cédula';
                console.log('📄 Cédula encontrada:', cedula, 'para paciente:', patient.nombre);

                if (!patientId) {
                    console.warn('⚠️ Paciente sin ID válido:', patient);
                    return null; // Retornar null para filtrar después
                }

                return {
                    label: `${patient.nombre || 'Sin nombre'} ${patient.apellido || 'Sin apellido'} (Cédula: ${cedula})`,
                    value: patientId.toString(),
                    name: `${patient.nombre || 'Sin nombre'} ${patient.apellido || 'Sin apellido'}`
                };
            }).filter(patient => patient !== null); // Filtrar pacientes nulos            console.log('✅ Pacientes formateados:', formattedPatients);
            setPatients(formattedPatients);

            if (formattedPatients.length === 0) {
                console.warn('⚠️ No se pudieron formatear pacientes válidos');
            }
        } catch (error) {
            console.error('❌ Error al cargar pacientes:', error);
            console.error('❌ Detalles del error:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            setPatients([]);
        } finally {
            setLoadingPatients(false);
        }
    };

    // Función para cargar médicos desde la API
    const loadMedicos = async () => {
        try {
            console.log('🔄 Iniciando carga de médicos...');
            setLoadingMedicos(true);
            const medicosData = await citaService.getAllMedicos();
            console.log('📊 Datos de médicos recibidos:', medicosData);

            // Verificar si hay datos
            if (!medicosData || !Array.isArray(medicosData)) {
                console.warn('⚠️ Los datos de médicos no son un array válido:', medicosData);
                setMedicos([]);
                return;
            }

            // Transformar los datos para el formato del Dropdown
            const formattedMedicos = medicosData.map(medico => {
                console.log('🔄 Procesando médico:', medico);

                // Manejar diferentes formatos de ID (medicoId vs medicoID)
                const medicoId = medico.medicoId || medico.medicoID || medico.id;

                // Manejar diferentes formatos de cédula
                const cedula = medico.cedula || medico.numeroIdentificacion || medico.cedulaIdentidad || 'Sin cédula';
                console.log('📄 Cédula encontrada:', cedula, 'para médico:', medico.nombre);

                if (!medicoId) {
                    console.warn('⚠️ Médico sin ID válido:', medico);
                    return null; // Retornar null para filtrar después
                }

                return {
                    label: `Dr. ${medico.nombre || 'Sin nombre'} ${medico.apellido || 'Sin apellido'} (Cédula: ${cedula})`,
                    value: medicoId.toString(),
                    name: `Dr. ${medico.nombre || 'Sin nombre'} ${medico.apellido || 'Sin apellido'}`
                };
            }).filter(medico => medico !== null); // Filtrar médicos nulos            console.log('✅ Médicos formateados:', formattedMedicos);
            setMedicos(formattedMedicos);

            if (formattedMedicos.length === 0) {
                console.warn('⚠️ No se pudieron formatear médicos válidos');
            }
        } catch (error) {
            console.error('❌ Error al cargar médicos:', error);
            console.error('❌ Detalles del error:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            setMedicos([]);
        } finally {
            setLoadingMedicos(false);
        }
    };

    // Cargar pacientes, médicos y tratamientos al montar el componente
    useEffect(() => {
        loadPatients();
        loadMedicos();
        loadTreatments();
    }, []);

    // UseEffect para manejar la selección de tratamiento por descripción cuando los tratamientos estén cargados
    useEffect(() => {
        if (isEditMode && appointmentToEdit && treatments.length > 0 && selectedTreatment) {
            // Si selectedTreatment es una descripción (string largo), buscar el ID correspondiente
            if (isNaN(selectedTreatment) && selectedTreatment.length > 5) {
                console.log('🔍 Buscando tratamiento por descripción:', selectedTreatment);
                const foundTreatment = treatments.find(treatment =>
                    treatment.descripcion.toLowerCase().includes(selectedTreatment.toLowerCase()) ||
                    selectedTreatment.toLowerCase().includes(treatment.descripcion.toLowerCase())
                );

                if (foundTreatment) {
                    console.log('✅ Tratamiento encontrado por descripción:', foundTreatment);
                    setSelectedTreatment(foundTreatment.value);
                } else {
                    console.warn('⚠️ No se encontró tratamiento para la descripción:', selectedTreatment);
                }
            }
        }
    }, [treatments, isEditMode, appointmentToEdit]);

    const handlePatientRegistered = (newPatient) => {
        console.log('Paciente Registrado desde el modal:', newPatient);
        setShowPatientRegistrationModal(false);
        // Recargar la lista de pacientes después de registrar uno nuevo
        loadPatients();
    };

    const handleCancelPatientRegistration = () => {
        setShowPatientRegistrationModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedPatient || !selectedMedico || !appointmentDate || !appointmentTime || !selectedTreatment) {
            alert('Todos los campos son obligatorios.');
            return;
        }

        const patientDetails = patients.find(p => p.value === selectedPatient);
        const medicoDetails = medicos.find(m => m.value === selectedMedico);
        const treatmentDetails = treatments.find(t => t.value === selectedTreatment);

        if (isEditMode) {
            // **MODO EDICIÓN**: Formato para PUT - necesita cédulas
            console.log('🔄 === MODO EDICIÓN - PREPARANDO DATOS PARA PUT ===');

            // Extraer cédulas de los labels de los dropdowns
            const pacienteCedula = extractCedulaFromLabel(patientDetails?.label || '');
            const medicoCedula = extractCedulaFromLabel(medicoDetails?.label || '');

            console.log('👤 Cédula del paciente extraída:', pacienteCedula);
            console.log('👨‍⚕️ Cédula del médico extraída:', medicoCedula);

            const editAppointmentData = {
                pacienteCedula: pacienteCedula,
                medicoCedula: medicoCedula,
                fechaHora: appointmentDate.toISOString().split('T')[0] + 'T' + convertTimeToAPI(appointmentTime),
                motivoConsulta: treatmentDetails ? treatmentDetails.descripcion : 'Tratamiento no especificado', // Enviar descripción como string
                estadoId: 102, // Usar estadoId (consistente entre POST y PUT)
                // Para Dashboard - ID de la cita para URL
                citaId: parseInt(appointmentToEdit.citaId || appointmentToEdit.citaID),
                // Campos adicionales para el frontend
                patientName: patientDetails ? patientDetails.name : 'Desconocido',
                medicoName: medicoDetails ? medicoDetails.name : 'Desconocido',
                treatmentName: treatmentDetails ? treatmentDetails.descripcion : 'Desconocido',
                tratamientoId: parseInt(selectedTreatment), // Mantener ID para uso interno del frontend
                date: appointmentDate.toLocaleDateString('es-ES'),
                time: appointmentTime,
                isEditMode: true // Bandera para que Dashboard sepa el modo
            };

            console.log('📤 Datos para EDITAR cita:', editAppointmentData);
            onAppointmentRegistered(editAppointmentData);
        } else {
            // **MODO CREACIÓN**: Formato para POST - necesita cédulas también
            console.log('🆕 === MODO CREACIÓN - PREPARANDO DATOS PARA POST ===');

            // Extraer cédulas de los labels de los dropdowns (igual que en edición)
            const pacienteCedula = extractCedulaFromLabel(patientDetails?.label || '');
            const medicoCedula = extractCedulaFromLabel(medicoDetails?.label || '');

            console.log('👤 Cédula del paciente extraída:', pacienteCedula);
            console.log('👨‍⚕️ Cédula del médico extraída:', medicoCedula);

            // Generar un citaId temporal para el POST (el servidor puede asignar el real)
            const temporalCitaId = Date.now(); // Usar timestamp como ID temporal

            const createAppointmentData = {
                citaId: temporalCitaId, // Incluir citaId para la lógica del frontend
                pacienteCedula: pacienteCedula,  // POST usa cédulas
                medicoCedula: medicoCedula,      // POST usa cédulas
                fechaHora: appointmentDate.toISOString().split('T')[0] + 'T' + convertTimeToAPI(appointmentTime),
                motivoConsulta: treatmentDetails ? treatmentDetails.descripcion : 'Tratamiento no especificado', // Enviar descripción como string
                estadoId: 102, // Usar estadoId (consistente con PUT)
                // Campos adicionales para el frontend
                patientName: patientDetails ? patientDetails.name : 'Desconocido',
                medicoName: medicoDetails ? medicoDetails.name : 'Desconocido',
                treatmentName: treatmentDetails ? treatmentDetails.descripcion : 'Desconocido',
                tratamientoId: parseInt(selectedTreatment), // Mantener ID para uso interno del frontend
                date: appointmentDate.toLocaleDateString('es-ES'),
                time: appointmentTime,
                isEditMode: false // Bandera para que Dashboard sepa el modo
            };

            console.log('📤 Datos para CREAR cita (con cédulas):', createAppointmentData);
            onAppointmentRegistered(createAppointmentData);
        }
    };

    // Función auxiliar para extraer cédula del label del dropdown
    const extractCedulaFromLabel = (label) => {
        // El label tiene formato: "Nombre Apellido (Cédula: 00598765432)"
        const match = label.match(/Cédula:\s*(\w+)/);
        return match ? match[1] : '';
    };

    // Función auxiliar para convertir la hora del formato del frontend al formato de la API
    const convertTimeToAPI = (timeString) => {
        // Convertir "10:30 AM" a "10:30:00"
        const [time, period] = timeString.split(' ');
        let [hours, minutes] = time.split(':');

        if (period === 'PM' && hours !== '12') {
            hours = (parseInt(hours) + 12).toString();
        } else if (period === 'AM' && hours === '12') {
            hours = '00';
        }

        return `${hours.padStart(2, '0')}:${minutes}:00`;
    };

    return (
        <form onSubmit={handleSubmit} className="p-fluid grid formgrid container-dialog">
            {/* TEMPORAL: Botón de debug */}
            {/* <div className="col-12 mb-2">
                <div className="grid">
                    <div className="col-6">
                        <Button
                            type="button"
                            label={`Debug - Pacientes (${patients.length})`}
                            className="p-button-secondary p-button-sm w-full"
                            onClick={loadPatients}
                            loading={loadingPatients}
                        />
                        {patients.length > 0 && (
                            <small className="block mt-1 text-green-500">
                                ✅ Pacientes: {patients.map(p => p.name).join(', ')}
                            </small>
                        )}
                    </div>
                    <div className="col-6">
                        <Button
                            type="button"
                            label={`Debug - Médicos (${medicos.length})`}
                            className="p-button-secondary p-button-sm w-full"
                            onClick={loadMedicos}
                            loading={loadingMedicos}
                        />
                        {medicos.length > 0 && (
                            <small className="block mt-1 text-green-500">
                                ✅ Médicos: {medicos.map(m => m.name).join(', ')}
                            </small>
                        )}
                    </div>
                </div>
            </div> */}

            {/* Mensaje informativo en modo edición */}
            {isEditMode && appointmentToEdit && (
                <div className="col-12 mb-3">
                    <div className="p-3 border-round" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', color: '#856404' }}>
                        <i className="pi pi-info-circle mr-2"></i>
                        <strong>Editando Cita ID: {appointmentToEdit.citaId}</strong>
                        <br />
                        <small>Modifica los campos necesarios y guarda los cambios.</small>
                    </div>
                </div>
            )}

            {/* Botón para abrir el formulario de registro de paciente - Solo mostrar en modo creación */}
            {!isEditMode && (
                <Button
                    type="button"
                    label="Registrar Paciente"
                    className="p-button-text"
                    onClick={() => setShowPatientRegistrationModal(true)}
                />
            )}

            <div className="field col-12">
                <label htmlFor="patient">Paciente</label>
                <Dropdown
                    id="patient"
                    value={selectedPatient}
                    options={patients}
                    onChange={(e) => setSelectedPatient(e.value)}
                    placeholder={loadingPatients ? "Cargando pacientes..." : "Seleccionar Paciente"}
                    loading={loadingPatients}
                    onShow={loadPatients}
                    filter
                    filterPlaceholder="Buscar..."
                    emptyMessage="No se encontraron pacientes"
                    required
                />
            </div>

            <div className="field col-12">
                <label htmlFor="medico">Médico</label>
                <Dropdown
                    id="medico"
                    value={selectedMedico}
                    options={medicos}
                    onChange={(e) => setSelectedMedico(e.value)}
                    placeholder={loadingMedicos ? "Cargando médicos..." : "Seleccionar Médico"}
                    loading={loadingMedicos}
                    onShow={loadMedicos}
                    filter
                    filterPlaceholder="Buscar..."
                    emptyMessage="No se encontraron médicos"
                    required
                />
            </div>

            <div className="field col-12 md:col-6">
                <label htmlFor="appointmentDate">Fecha</label>
                <Calendar id="appointmentDate" value={appointmentDate} onChange={(e) => setAppointmentDate(e.value)} dateFormat="dd/mm/yy" showIcon required minDate={new Date()} />
            </div>
            <div className="field col-12 md:col-6">
                <label htmlFor="appointmentTime">Hora</label>
                <Dropdown id="appointmentTime" value={appointmentTime} options={timeSlots} onChange={(e) => setAppointmentTime(e.value)} placeholder="Seleccionar Hora" required />
            </div>
            <div className="field col-12">
                <label htmlFor="treatment">Tratamiento</label>
                <Dropdown
                    id="treatment"
                    value={selectedTreatment}
                    options={treatments}
                    onChange={(e) => setSelectedTreatment(e.value)}
                    placeholder={loadingTreatments ? "Cargando tratamientos..." : "Seleccionar Tratamiento"}
                    loading={loadingTreatments}
                    onShow={loadTreatments}
                    filter
                    filterPlaceholder="Buscar tratamiento..."
                    emptyMessage="No se encontraron tratamientos"
                    required
                />
            </div>

            <div className="col-12 flex justify-content-end gap-2 mt-4">
                {/* <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} /> */}
                <Button type="submit" label={isEditMode ? "Editar Cita" : "Registrar Cita"} /> {/* icon="pi pi-check" /> */}
            </div>

            {/* Componente Dialog para mostrar PatientRegistrationForm */}
            <Dialog
                header="Registrar Paciente"
                visible={showPatientRegistrationModal}
                style={{ width: '50vw' }}
                modal
                onHide={handleCancelPatientRegistration}
            >
                {/* Renderiza el formulario de registro de paciente dentro del Dialog */}
                <PatientRegistrationForm
                    onPatientRegistered={handlePatientRegistered}
                    onCancel={handleCancelPatientRegistration}
                />
            </Dialog>
        </form>
    );
}