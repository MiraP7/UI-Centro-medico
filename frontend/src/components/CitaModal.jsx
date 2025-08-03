import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import CitaService from '../Services/CitaService';

/**
 * Modal para registrar y editar citas
 * Integra con el CitaService actualizado con CRUD completo
 */
const CitaModal = ({
    visible,
    onHide,
    citaToEdit = null,
    pacientes = [],
    medicos = [],
    onCitaCreated,
    onCitaUpdated
}) => {
    const [formData, setFormData] = useState({
        pacienteId: '',
        medicoId: '',
        fechaHora: null,
        motivoConsulta: '',
        estadoId: 102 // Por defecto: Pendiente
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const citaService = new CitaService();

    const estadosOptions = [
        { label: 'Activo', value: 100 },
        { label: 'Inactivo', value: 101 },
        { label: 'Pendiente', value: 102 },
        { label: 'Completado', value: 103 },
        { label: 'Cancelado', value: 104 },
        { label: 'Aprobado', value: 105 },
        { label: 'Rechazado', value: 106 }
    ];

    // Configurar datos iniciales al abrir modal
    React.useEffect(() => {
        if (visible) {
            if (citaToEdit) {
                // Modo edición
                setFormData({
                    pacienteId: citaToEdit.pacienteId || citaToEdit.pacienteID || '',
                    medicoId: citaToEdit.medicoId || citaToEdit.medicoID || '',
                    fechaHora: citaToEdit.fechaHora ? new Date(citaToEdit.fechaHora) : null,
                    motivoConsulta: citaToEdit.motivoConsulta || '',
                    estadoId: citaToEdit.estadoId || citaToEdit.estadoID || 102
                });
            } else {
                // Modo creación - resetear formulario
                setFormData({
                    pacienteId: '',
                    medicoId: '',
                    fechaHora: null,
                    motivoConsulta: '',
                    estadoId: 102
                });
            }
            setError('');
        }
    }, [visible, citaToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (citaToEdit) {
                // Actualizar cita existente
                const result = await citaService.updateCita(citaToEdit.citaId, formData);
                console.log('Cita actualizada:', result);

                if (onCitaUpdated) {
                    onCitaUpdated(result);
                }

                // Mostrar mensaje de éxito
                showSuccess('Cita actualizada exitosamente');
            } else {
                // Crear nueva cita
                const result = await citaService.createCita(formData);
                console.log('Cita creada:', result);

                if (onCitaCreated) {
                    onCitaCreated(result);
                }

                // Mostrar mensaje de éxito
                showSuccess('Cita registrada exitosamente');
            }

            // Cerrar modal
            onHide();
        } catch (error) {
            console.error('Error al procesar cita:', error);
            setError(error.message || 'Error al procesar la cita');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        // Aquí puedes implementar la lógica para mostrar toast
        console.log('Éxito:', message);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={citaToEdit ? 'Editar Cita' : 'Registrar Nueva Cita'}
            style={{ width: '500px' }}
            modal
            closable={!loading}
        >
            <form onSubmit={handleSubmit} className="p-fluid">
                {error && (
                    <Message severity="error" text={error} className="w-full mb-3" />
                )}

                {/* Selector de Paciente */}
                <div className="field">
                    <label htmlFor="paciente">Paciente *</label>
                    <Dropdown
                        id="paciente"
                        value={formData.pacienteId}
                        options={pacientes.map(p => ({
                            label: `${p.nombre} ${p.apellido}`,
                            value: p.pacienteId
                        }))}
                        onChange={(e) => handleInputChange('pacienteId', e.value)}
                        placeholder="Seleccione un paciente"
                        disabled={loading}
                        required
                    />
                </div>

                {/* Selector de Médico */}
                <div className="field">
                    <label htmlFor="medico">Médico *</label>
                    <Dropdown
                        id="medico"
                        value={formData.medicoId}
                        options={medicos.map(m => ({
                            label: `${m.nombre} ${m.apellido}`,
                            value: m.medicoId
                        }))}
                        onChange={(e) => handleInputChange('medicoId', e.value)}
                        placeholder="Seleccione un médico"
                        disabled={loading}
                        required
                    />
                </div>

                {/* Fecha y Hora */}
                <div className="field">
                    <label htmlFor="fechaHora">Fecha y Hora *</label>
                    <Calendar
                        id="fechaHora"
                        value={formData.fechaHora}
                        onChange={(e) => handleInputChange('fechaHora', e.value)}
                        showTime
                        hourFormat="12"
                        placeholder="Seleccione fecha y hora"
                        disabled={loading}
                        required
                    />
                </div>

                {/* Motivo de Consulta */}
                <div className="field">
                    <label htmlFor="motivo">Motivo de Consulta *</label>
                    <InputTextarea
                        id="motivo"
                        value={formData.motivoConsulta}
                        onChange={(e) => handleInputChange('motivoConsulta', e.target.value)}
                        placeholder="Ingrese el motivo de la consulta"
                        rows={3}
                        disabled={loading}
                        required
                    />
                </div>

                {/* Estado */}
                <div className="field">
                    <label htmlFor="estado">Estado</label>
                    <Dropdown
                        id="estado"
                        value={formData.estadoId}
                        options={estadosOptions}
                        onChange={(e) => handleInputChange('estadoId', e.value)}
                        disabled={loading}
                    />
                </div>

                {/* Botones */}
                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        type="button"
                        label="Cancelar"
                        icon="pi pi-times"
                        severity="secondary"
                        onClick={onHide}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        label={citaToEdit ? 'Actualizar' : 'Registrar'}
                        icon={citaToEdit ? 'pi pi-check' : 'pi pi-plus'}
                        loading={loading}
                    />
                </div>
            </form>
        </Dialog>
    );
};

export default CitaModal;
