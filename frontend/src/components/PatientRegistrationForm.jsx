import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';

export default function PatientRegistrationForm({ onPatientRegistered, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    dni: '',
    dob: null,
    phone: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, dob: e.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.lastName || !formData.dni) {
      alert('Nombre, Apellido y DNI son obligatorios.'); // Considerar usar Toast de PrimeReact para notificaciones
      return;
    }
    onPatientRegistered({...formData, dob: formData.dob ? formData.dob.toLocaleDateString('es-ES') : null});
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
      <div className="field col-12 md:col-6"><label htmlFor="name">Nombre</label><InputText id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
      <div className="field col-12 md:col-6"><label htmlFor="lastName">Apellido</label><InputText id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
      <div className="field col-12 md:col-6"><label htmlFor="dni">DNI/Cédula</label><InputText id="dni" name="dni" value={formData.dni} onChange={handleChange} required /></div>
      <div className="field col-12 md:col-6"><label htmlFor="dob">Fecha de Nacimiento</label><Calendar id="dob" name="dob" value={formData.dob} onChange={handleDateChange} dateFormat="dd/mm/yy" showIcon /></div>
      <div className="field col-12 md:col-6"><label htmlFor="phone">Teléfono</label><InputText id="phone" name="phone" keyfilter="pnum" value={formData.phone} onChange={handleChange} /></div>
      <div className="field col-12 md:col-6"><label htmlFor="email">Correo Electrónico</label><InputText id="email" name="email" type="email" value={formData.email} onChange={handleChange} /></div>
      
      <div className="col-12 flex justify-content-end gap-2 mt-4">
        <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onCancel} />
        <Button type="submit" label="Registrar Paciente" icon="pi pi-check" />
      </div>
    </form>
  );
}