import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

export default function AppointmentRegistrationForm({ onAppointmentRegistered, onCancel }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');

  // Simulación: en una app real, estos datos vendrían de una API o estado global
  const patients = [
    { label: 'Juan Pérez (ID: 101)', value: '101', name: 'Juan Pérez' },
    { label: 'Ana Gómez (ID: 102)', value: '102', name: 'Ana Gómez' },
  ];

  const timeSlots = [
    { label: '09:00 AM', value: '09:00 AM' }, { label: '09:30 AM', value: '09:30 AM' },
    { label: '10:00 AM', value: '10:00 AM' }, { label: '10:30 AM', value: '10:30 AM' },
    { label: '11:00 AM', value: '11:00 AM' }, { label: '11:30 AM', value: '11:30 AM' },
    // ... más horarios
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient || !appointmentDate || !appointmentTime || !reason) {
      alert('Todos los campos son obligatorios.'); // Usar Toast para mejor UX
      return;
    }
    const patientDetails = patients.find(p => p.value === selectedPatient);
    onAppointmentRegistered({
      patientId: selectedPatient,
      patientName: patientDetails ? patientDetails.name : 'Desconocido',
      date: appointmentDate.toLocaleDateString('es-ES'),
      time: appointmentTime,
      reason,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
      <div className="field col-12">
        <label htmlFor="patient">Paciente</label>
        <Dropdown id="patient" value={selectedPatient} options={patients} onChange={(e) => setSelectedPatient(e.value)} placeholder="Seleccionar Paciente" required />
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
        <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} />
        <Button type="submit" label="Registrar Cita" icon="pi pi-check" />
      </div>
    </form>
  );
}