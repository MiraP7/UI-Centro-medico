import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import PatientRegistrationForm from './PatientRegistrationForm';
import AppointmentRegistrationForm from './AppointmentRegistrationForm';

const initialAppointments = [
  { id: 1, time: '09:00 AM', patient: 'Juan Pérez', reason: 'Consulta General' },
  { id: 2, time: '10:30 AM', patient: 'Ana Gómez', reason: 'Revisión Dental' },
];

export default function Dashboard({ onLogout }) {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointments, setAppointments] = useState(initialAppointments);

  const handlePatientRegistered = (newPatient) => {
    console.log('Paciente Registrado:', newPatient);
    setShowPatientModal(false);
    // Aquí podrías actualizar una lista de pacientes o mostrar un mensaje de éxito.
  };

  const handleAppointmentRegistered = (newAppointment) => {
    console.log('Cita Registrada:', newAppointment);
    // Para simulación, podríamos añadirla a la lista actual
    setAppointments(prev => [...prev, { ...newAppointment, id: Date.now(), patient: newAppointment.patientName || 'Nuevo Paciente' }]);
    setShowAppointmentModal(false);
  };

  return (
    <div className="p-4">
      <header className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold">Panel del Centro Médico</h1>
        <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-danger" onClick={onLogout} />
      </header>

      <div className="grid">
        <div className="col-12 md:col-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-3">Citas del Día</h2>
            <DataTable value={appointments} responsiveLayout="scroll" emptyMessage="No hay citas programadas para hoy.">
              <Column field="time" header="Hora"></Column>
              <Column field="patient" header="Paciente"></Column>
              <Column field="reason" header="Motivo"></Column>
            </DataTable>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-3">Acciones Rápidas</h2>
            <div className="flex flex-column gap-3">
              <Button label="Registrar Paciente" icon="pi pi-user-plus" onClick={() => setShowPatientModal(true)} className="p-button-success" />
              <Button label="Registrar Cita" icon="pi pi-calendar-plus" onClick={() => setShowAppointmentModal(true)} className="p-button-info" />
            </div>
          </div>
        </div>
      </div>

      <Dialog header="Registrar Nuevo Paciente" visible={showPatientModal} style={{ width: '50vw', minWidth: '350px' }} onHide={() => setShowPatientModal(false)} modal>
        <PatientRegistrationForm onPatientRegistered={handlePatientRegistered} onCancel={() => setShowPatientModal(false)} />
      </Dialog>

      <Dialog header="Registrar Nueva Cita" visible={showAppointmentModal} style={{ width: '50vw', minWidth: '350px' }} onHide={() => setShowAppointmentModal(false)} modal>
        <AppointmentRegistrationForm 
            onAppointmentRegistered={handleAppointmentRegistered} 
            onCancel={() => setShowAppointmentModal(false)} 
        />
      </Dialog>
    </div>
  );
}