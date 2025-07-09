import React, { useState } from 'react';
const RegistroPaciente = () => {
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

  // Manejador para actualizar el estado cuando el usuario escribe en un campo del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Manejador para enviar el formulario al backend
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

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>Registro de Nuevo Paciente</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nombre:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Apellido:</label>
          <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Fecha de Nacimiento:</label>
          <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Sexo:</label>
          <select name="sexo" value={formData.sexo} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Dirección:</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Teléfono:</label>
          <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>ID de Aseguradora:</label>
          <input type="number" name="aseguradoraID" value={formData.aseguradoraID || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Número de Póliza:</label>
          <input type="text" name="numeroPoliza" value={formData.numeroPoliza} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Registrar Paciente</button>
      </form>
      {mensaje && <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e7f3fe', border: '1px solid #d0eaff' }}>{mensaje}</p>}
    </div>
  );
};

export default RegistroPaciente;