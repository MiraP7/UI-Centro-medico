import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { ProgressSpinner } from 'primereact/progressspinner';  
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import backgroundImage from './Image.jpg';

const BACKGROUND_IMAGE_URL = backgroundImage;

// Definición de los colores
const COLOR_AZUL_CLARO = '#007bff';
const COLOR_AZUL_MARINO = '#003366';
const COLOR_BLANCO = '#ffffff';
const COLOR_ROJO_ERROR = '#ef4444';

export default function Login({ onLoginSuccess }) {
  const [usuario, setUsername] = useState('');  
  const [clave, setPassword] = useState('');  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  

  const [isUsernameHovered, setIsUsernameHovered] = useState(false);
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {  
    e.preventDefault();
    setError('');
    setLoading(true);  

    try {
      const response = await fetch('https://localhost:44388/api/Auth/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: usuario, clave: clave }),  
      });

      const data = await response.json();  

      if (response.ok) {  
        if (data.isSuccess) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('usuario', usuario);
          localStorage.setItem('clave', clave);

          onLoginSuccess();  
        } else {
           
          setError(data.message || 'Credenciales incorrectas. Intente de nuevo.');
        }
      } else {
         
        setError(data.message || 'Credenciales incorrectas. Intente de nuevo.');
      }
    } catch (err) {
      // Manejo de errores de red o cualquier otro error durante la petición
      console.error("Error durante el login:", err);
      setError('No se pudo conectar al servidor. Verifique su conexión.');
    } finally {
      setLoading(false); 
    }
  };

  const getInputStyle = (isHovered, isFocused) => {
    let borderColor = COLOR_AZUL_CLARO;
    let boxShadow = 'none';

    if (isFocused) {
      borderColor = COLOR_AZUL_CLARO;
      boxShadow = `0 0 0 0.2rem rgba(52, 152, 219, 0.25)`;
    } else if (isHovered) {
      borderColor = COLOR_AZUL_MARINO;
    }

    return {
      borderColor: borderColor,
      color: COLOR_AZUL_MARINO,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      outline: 'none'
    };
  };

  return (
    <div
      className="flex align-items-center justify-content-center min-h-screen"
      style={{
        backgroundImage: `url('${BACKGROUND_IMAGE_URL}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}
    >
      <div
        style={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)'
        }}
      ></div>

      <div
        className="p-fluid sm:w-full md:w-6 lg:w-4 xl:w-3 p-6 border-round shadow-2"
        style={{
          backgroundColor: COLOR_BLANCO,
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="text-center mb-5">
          <i className="pi pi-heart-fill" style={{ color: COLOR_AZUL_CLARO, fontSize: '3.5rem' }}></i>
          <h2 className="text-2xl font-bold mt-3 mb-0" style={{ color: COLOR_AZUL_MARINO }}>Iniciar Sesión</h2>
          <p className="text-sm mt-1" style={{ color: '#607d8b' }}>Bienvenido de nuevo a Health State</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block font-medium mb-2 text-center" style={{ color: COLOR_AZUL_MARINO }}>Usuario</label>
            <InputText
              id="username"
              type="text"
              value={usuario}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              className="w-full"
              style={getInputStyle(isUsernameHovered, isUsernameFocused)}
              onMouseEnter={() => setIsUsernameHovered(true)}
              onMouseLeave={() => setIsUsernameHovered(false)}
              onFocus={() => setIsUsernameFocused(true)}
              onBlur={() => setIsUsernameFocused(false)}
              disabled={loading}  
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block font-medium mb-2 text-center" style={{ color: COLOR_AZUL_MARINO }}>Contraseña</label>
            <Password
              id="password"
              value={clave}
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
              disabled={loading}  
            />
          </div>
          {error && <p className="text-xs mb-3" style={{ color: COLOR_ROJO_ERROR }}>{error}</p>}
          <Button
            type="submit"
            label={loading ? (
              <div className="flex align-items-center justify-content-center">
                <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="5" fill="var(--surface-ground)" animationDuration=".8s" />
                <span className="ml-2">Ingresando...</span>
              </div>
            ) : "Ingresar"}  
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
            disabled={loading}  
          />
        </form>
      </div>
    </div>
  );
}