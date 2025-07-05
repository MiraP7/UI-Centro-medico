import React from 'react';

export default function PatientModal({ onClose }) {
  const handleSubmit = (e) => { e.preventDefault(); alert("Paciente registrado (simulación)"); onClose(); };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Registrar Nuevo Paciente</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Columna 1 */}
            <div>
              <div><label>Nombre</label><input type="text" required /></div>
              <div><label>Fecha de Nacimiento</label><input type="date" required /></div>
            </div>
            {/* Columna 2 */}
            <div>
              <div><label>Apellido</label><input type="text" required /></div>
              <div><label>Sexo</label><select><option>Masculino</option></select></div>
            </div>
          </div>
          <button type="submit">Registrar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}