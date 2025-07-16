import React, { useState } from 'react';
//"npm run dev" en la terminal para ver en local host 
// Componente de React para el formulario de registro de pacientes
const RegistroPaciente = () => {
  // Se utiliza el hook useState para gestionar el estado del formulario.
  // La estructura del estado inicial coincide con el modelo de datos del backend para la entidad 'Pacientes'.
  // Fuentes: diccionario_de_datos_con_descripcion.docx, Acta de Constitucion del Proyecto - HeathState.pdf
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    sexo: 'M', // Valor por defecto
    direccion: '',
    telefono: '',
    email: '',
    aseguradoraID: null, // Podría venir de otra llamada a la API
    numeroPoliza: ''
  });

  const [mensaje, setMensaje] = useState(''); // Para mostrar mensajes de éxito o error

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
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setMensaje('Enviando datos...');

    // La comunicación con la aseguradora se realiza vía API.
    // Fuente: Alcance del Proyecto, Chat de WhatsApp
    try {
      // Se asume que el endpoint del backend para crear un paciente es '/api/pacientes' con el método POST.
      // Esta es una convención común en APIs RESTful de .NET.
      const response = await fetch('/api/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Convierte el estado del formulario a un string JSON
      });

      if (response.ok) {
        // Si la respuesta es exitosa (ej. status 201 Created)
        const pacienteCreado = await response.json();
        setMensaje(`Paciente ${pacienteCreado.nombre} registrado con éxito con el ID: ${pacienteCreado.pacienteID}`);
        // Limpiar el formulario
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
        // Si hay un error en la respuesta del servidor
        const errorData = await response.text();
        setMensaje(`Error al registrar el paciente: ${errorData}`);
      }
    } catch (error) {
      // Si hay un error de red o de otro tipo
      setMensaje(`Error de conexión: ${error.message}`);
    }
  };

  // Estructura JSX del formulario
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
          {/* Este campo idealmente sería un <select> poblado con datos de las aseguradoras */}
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