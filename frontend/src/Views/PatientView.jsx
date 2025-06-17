import React, { useState } from 'react';
import PatientModal from '../components/PatientModal.jsx';
import AppointmentModal from '../components/AppointmentModal.jsx';

export default function PatientView() {
    const [isPatientModalOpen, setPatientModalOpen] = useState(false);
    const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Datos de ejemplo
    const mockPatients = [
        { id: 1, name: 'Ana García', dob: '1985-05-20' },
        { id: 2, name: 'Carlos Rodriguez', dob: '1992-11-10' },
    ];
    
    const handleOpenAppointmentModal = (patient) => {
        setSelectedPatient(patient);
        setAppointmentModalOpen(true);
    };

    return (
        <div>
            <h2>Gestión de Pacientes</h2>
            <button onClick={() => setPatientModalOpen(true)}>Registrar Paciente</button>
            
            {/* Tabla de pacientes */}
            <table>
                <thead><tr><th>Nombre</th><th>Acciones</th></tr></thead>
                <tbody>
                    {mockPatients.map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td><button onClick={() => handleOpenAppointmentModal(p)}>Agendar Cita</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isPatientModalOpen && <PatientModal onClose={() => setPatientModalOpen(false)} />}
            {isAppointmentModalOpen && <AppointmentModal patient={selectedPatient} onClose={() => setAppointmentModalOpen(false)} />}
        </div>
    );
}