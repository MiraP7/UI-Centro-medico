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
    const [reason, setReason] = useState('');
    const [patients, setPatients] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingMedicos, setLoadingMedicos] = useState(false);

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

            // Manejar el motivo de la consulta
            if (appointmentToEdit.motivoConsulta || appointmentToEdit.reason) {
                const reasonValue = appointmentToEdit.motivoConsulta || appointmentToEdit.reason;
                console.log('📝 Configurando motivo:', reasonValue);
                setReason(reasonValue);
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
            setReason('');
        }
    }, [isEditMode, appointmentToEdit]);

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

    // Cargar pacientes y médicos al montar el componente
    useEffect(() => {
        loadPatients();
        loadMedicos();
    }, []);

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
        if (!selectedPatient || !selectedMedico || !appointmentDate || !appointmentTime || !reason) {
            alert('Todos los campos son obligatorios.');
            return;
        }

        const patientDetails = patients.find(p => p.value === selectedPatient);
        const medicoDetails = medicos.find(m => m.value === selectedMedico);
        const appointmentData = {
            patientId: selectedPatient,
            patientName: patientDetails ? patientDetails.name : 'Desconocido',
            medicoId: selectedMedico,
            medicoName: medicoDetails ? medicoDetails.name : 'Desconocido',
            date: appointmentDate.toLocaleDateString('es-ES'),
            time: appointmentTime,
            reason,
            // Si estamos editando, incluir el ID de la cita
            ...(isEditMode && appointmentToEdit && { citaId: appointmentToEdit.citaId })
        };

        onAppointmentRegistered(appointmentData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-fluid grid formgrid container-dialog">
            {/* TEMPORAL: Botón de debug */}
            <div className="col-12 mb-2">
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
            </div>

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
                    filterPlaceholder="Buscar por nombre o cédula..."
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
                    filterPlaceholder="Buscar por nombre o cédula..."
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
                <label htmlFor="reason">Motivo de la Cita</label>
                <InputTextarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required />
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