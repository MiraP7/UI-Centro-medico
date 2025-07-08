import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { ProgressSpinner } from 'primereact/progressspinner'; // Importa el spinner
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import './Login.css'; // Asegúrate de tener un archivo CSS para estilos personalizados


export default function Login({ onLoginSuccess }) {
  const [usuario, setUsername] = useState(''); // Deja vacío para que el usuario lo ingrese
  const [clave, setPassword] = useState(''); // Deja vacío
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Nuevo estado para el indicador de carga

  const [isUsernameHovered, setIsUsernameHovered] = useState(false);
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e) => { // Hacemos la función asíncrona
    e.preventDefault();
    setError('');
    setLoading(true); // Activa el estado de carga

    try {
      const response = await fetch('https://localhost:44388/api/Auth/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: usuario, clave: clave }), // Envía usuario y contraseña
      });

      const data = await response.json(); // Parsea la respuesta JSON

      if (response.ok) { // Si la respuesta HTTP es 2xx (OK)
        if (data.isSuccess) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('usuario', usuario);
          localStorage.setItem('clave', clave);

          onLoginSuccess(); // Llama a la función de éxito
        } else {
          // Si la API indica fallo de negocio (isSuccess: false)
          setError(data.message || 'Credenciales incorrectas. Intente de nuevo.');
        }
      } else {
        // Si hay un error HTTP (ej. 400, 500)
        setError(data.message || `Error en el servidor: ${response.statusText}`);
      }
    } catch (err) {
      // Manejo de errores de red o cualquier otro error durante la petición
      console.error("Error durante el login:", err);
      setError('No se pudo conectar al servidor. Verifique su conexión.');
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  const getInputStyle = (isHovered, isFocused) => {
    let borderColor = '#000';
    let boxShadow = 'none';

    if (isFocused) {
      borderColor = '#000';
      boxShadow = `0 0 0 0.2rem rgba(52, 152, 219, 0.25)`;
    } else if (isHovered) {
      borderColor = '#000';
    }

    return {
      borderColor: borderColor,
      color: '#000',
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      outline: 'none'
    };
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen login-container" >

      <article className='flex align-items-center justify-content-center w-full h-full' >
        <section
          className="p-fluid sm:w-full md:w-6 lg:w-4 xl:w-3 p-6 border-round shadow-6"

        >
          <div className="text-center mb-5">
            {/* <i className="pi pi-heart-fill" ></i> */}
            <h2 className="text-2xl font-bold mt-3 mb-0" >Iniciar Sesión</h2>
            <p className="text-sm mt-1" >Bienvenido de nuevo a Health State</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block font-medium mb-2 text-center">Usuario</label>
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
                disabled={loading} // Deshabilita mientras carga
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block font-medium mb-2 text-center" >Contraseña</label>
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
                disabled={loading} // Deshabilita mientras carga
              />
            </div>
            {error && <p className="text-xs mb-3">{error}</p>}
            <Button
              type="submit"
              label={loading ? (
                <div className="flex align-items-center justify-content-center">
                  <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="5" fill="var(--surface-ground)" animationDuration=".8s" />
                  <span className="ml-2">Ingresando...</span>
                </div>
              ) : "Ingresar"} // Muestra spinner y texto de carga
              className="w-full p-button-raised"
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
                e.currentTarget.style.borderColor = '#000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              disabled={loading} // Deshabilita el botón mientras carga
            />
          </form>
        </section>

        <section className='logo p-fluid sm:w-full md:w-6 lg:w-4 xl:w-3 p-6 border-round shadow-6'>
          <p>LOGO NO SE</p>
        </section>
      </article>
    </div>
  );
}