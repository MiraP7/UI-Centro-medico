import React from 'react';

export default function AppointmentModal({ patient, onClose }) {
  const handleSubmit = (e) => { e.preventDefault(); alert(`Cita agendada para ${patient.name} (simulación)`); onClose(); };
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth: '500px'}}>
        <h2>Agendar Cita para {patient.name}</h2>
        <form onSubmit={handleSubmit}>
          {/* ... campos del formulario de cita ... */}
          <button type="submit">Agendar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}
