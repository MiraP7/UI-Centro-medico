import React, { useState } from 'react';
import './RegistroPaciente.css'; // 1. Importa el nuevo archivo CSS

// Componente de React para el formulario de registro de pacientes
const RegistroPaciente = () => {
  // ... (toda tu lógica de useState, handleChange y handleSubmit se mantiene igual)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    sexo: 'M',
    direccion: '',
    telefono: '',
    email: '',
    aseguradoraID: null,
    numeroPoliza: ''
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Enviando datos...');
    try {
      const response = await fetch('/api/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const pacienteCreado = await response.json();
        setMensaje(`Paciente ${pacienteCreado.nombre} registrado con éxito con el ID: ${pacienteCreado.pacienteID}`);
        setFormData({
            nombre: '',
            apellido: '',
            fechaNacimiento: '',
            sexo: 'M',
            direccion: '',
            telefono: '',
            email: '',
            aseguradoraID: null,
            numeroPoliza: ''
        });
      } else {
        const errorData = await response.text();
        setMensaje(`Error al registrar el paciente: ${errorData}`);
      }
    } catch (error) {
      setMensaje(`Error de conexión: ${error.message}`);
    }
  };

  // 2. Se reemplazan los 'style' por 'className'
  return (
    <div className="registro-paciente-container">
      <h2>Registro de Nuevo Paciente</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="form-input" />
        </div>
        <div className="form-group">
          <label>Apellido:</label>
          <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required className="form-input"/>
        </div>
        <div className="form-group">
          <label>Fecha de Nacimiento:</label>
          <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required className="form-input"/>
        </div>
        <div className="form-group">
          <label>Sexo:</label>
          <select name="sexo" value={formData.sexo} onChange={handleChange} className="form-input">
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label>Dirección:</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="form-input"/>
        </div>
        <div className="form-group">
          <label>Teléfono:</label>
          <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="form-input"/>
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input"/>
        </div>
        <div className="form-group">
          <label>ID de Aseguradora:</label>
          <input type="number" name="aseguradoraID" value={formData.aseguradoraID || ''} onChange={handleChange} className="form-input"/>
        </div>
        <div className="form-group">
          <label>Número de Póliza:</label>
          <input type="text" name="numeroPoliza" value={formData.numeroPoliza} onChange={handleChange} className="form-input"/>
        </div>
        <button type="submit" className="submit-btn">Registrar Paciente</button>
      </form>
      {mensaje && <p className="status-message">{mensaje}</p>}
    </div>
  );
};

export default RegistroPaciente;