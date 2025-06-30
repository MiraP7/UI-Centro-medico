import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Tu tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos base de PrimeReact
import 'primeflex/primeflex.css'; // Clases de utilidad de PrimeFlex
import backgroundImage from './Image.jpg'; 

// Las URLs de tus imágenes para el fondo
const BACKGROUND_IMAGE_URL = backgroundImage;

// Definición de los colores
const COLOR_AZUL_CLARO = '#007bff'; // Tu --primary-blue
const COLOR_AZUL_MARINO = '#003366'; // Tu --dark-blue
const COLOR_BLANCO = '#ffffff'; // Tu --white
const COLOR_GRIS_CLARO = '#f4f7f9'; // El --app-color-blanco-suave para el fondo del container
const COLOR_ROJO_ERROR = '#ef4444'; // Tailwind text-red-500

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('medico@healthstate.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  // Estados para manejar los estilos de hover y focus de los inputs
  const [isEmailHovered, setIsEmailHovered] = useState(false);
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Lógica de API simulada
    if (email === "medico@healthstate.com" && password === "password123") {
      localStorage.setItem('authToken', 'fake-jwt-token');
      onLoginSuccess();
    } else {
      setError('Credenciales incorrectas. Intente de nuevo.');
    }
  };

  // Función para obtener los estilos dinámicos de un input
  const getInputStyle = (isHovered, isFocused) => {
    let borderColor = COLOR_AZUL_CLARO; // Borde por defecto
    let boxShadow = 'none';

    if (isFocused) {
      borderColor = COLOR_AZUL_CLARO; // Borde azul claro cuando está enfocado
      boxShadow = `0 0 0 0.2rem rgba(52, 152, 219, 0.25)`; // Sombra azul claro al enfocar
    } else if (isHovered) {
      borderColor = COLOR_AZUL_MARINO; // Borde azul marino al pasar el mouse (si no está enfocado)
    }

    return {
      borderColor: borderColor,
      color: COLOR_AZUL_MARINO, // Color del texto siempre azul marino
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Transición suave
      outline: 'none' // Quitar el outline por defecto del navegador
    };
  };

  return (
    // Contenedor principal con la imagen de fondo y la capa semitransparente
    <div
      className="flex align-items-center justify-content-center min-h-screen"
      style={{
        backgroundImage: `url('${BACKGROUND_IMAGE_URL}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative' // Necesario para la capa before/after
      }}
    >
      {/* Capa semitransparente sobre la imagen de fondo */}
      <div
        style={{
          content: '""', // pseudo-elemento con contenido
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)' // Blanco semitransparente
        }}
      ></div>

      {/* Tarjeta del formulario de login */}
      <div
        className="p-fluid sm:w-full md:w-6 lg:w-4 xl:w-3 p-6 border-round shadow-2"
        style={{
          backgroundColor: COLOR_BLANCO, // Fondo blanco para el formulario
          position: 'relative', // Para que esté por encima de la capa semitransparente
          zIndex: 1 // Para que esté por encima de la capa semitransparente
        }}
      >
        {/* Logo/Icono y Título */}
        <div className="text-center mb-5">
          <i className="pi pi-heart-fill" style={{ color: COLOR_AZUL_CLARO, fontSize: '3.5rem' }}></i>
          <h2 className="text-2xl font-bold mt-3 mb-0" style={{ color: COLOR_AZUL_MARINO }}>Iniciar Sesión</h2>
          <p className="text-sm mt-1" style={{ color: '#607d8b' }}>Bienvenido de nuevo a Health State</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-2 text-center" style={{ color: COLOR_AZUL_MARINO }}>Correo Electrónico</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full"
              style={getInputStyle(isEmailHovered, isEmailFocused)}
              onMouseEnter={() => setIsEmailHovered(true)}
              onMouseLeave={() => setIsEmailHovered(false)}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block font-medium mb-2 text-center" style={{ color: COLOR_AZUL_MARINO }}>Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              feedback={false}
              toggleMask
              inputClassName="w-full"
              style={getInputStyle(isPasswordHovered, isPasswordFocused)}
              onMouseEnter={() => setIsPasswordHovered(true)}
              onMouseLeave={() => setIsPasswordHovered(false)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
          </div>
          {error && <p className="text-xs mb-3" style={{ color: COLOR_ROJO_ERROR }}>{error}</p>}
          <Button
            type="submit"
            label="Ingresar"
            className="w-full p-button-raised"
            style={{ backgroundColor: COLOR_AZUL_CLARO, borderColor: COLOR_AZUL_CLARO, color: COLOR_BLANCO }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = COLOR_AZUL_MARINO;
              e.currentTarget.style.borderColor = COLOR_AZUL_MARINO;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = COLOR_AZUL_CLARO;
              e.currentTarget.style.borderColor = COLOR_AZUL_CLARO;
            }}
          />
        </form>
      </div>
    </div>
  );
}