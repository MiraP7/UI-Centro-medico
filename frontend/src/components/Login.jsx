import React, { useState } from 'react';

// --- SVG Icono de Candado ---
// Un icono simple para mejorar el aspecto visual sin dependencias externas.
const LockIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);

// --- Componente Principal de la Aplicación ---
// Contiene la lógica y la estructura de la página de inicio de sesión.
function App() {
  // --- Estado del Componente ---
  // Se utiliza el hook `useState` para gestionar los valores de los campos del formulario.
  // Esto permite que la interfaz reaccione a la entrada del usuario.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Estado para manejar los mensajes de carga o error.
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Manejador de Envío del Formulario ---
  // Esta función se ejecuta cuando el usuario hace clic en el botón "Ingresar".
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene que la página se recargue.
    setIsLoading(true); // Activa el estado de carga.
    setMessage('Autenticando...'); // Muestra un mensaje al usuario.

    // --- Lógica de la API (Simulada) ---
    // En una aplicación real, aquí iría la llamada a la API del backend .NET.
    // Se enviaría el 'email' y 'password' para su validación.
    // Fuente: La necesidad de un login se basa en la tabla 'Usuarios' del diccionario de datos.
    console.log('Datos a enviar:', { email, password });
    
    // Simulación de una llamada a la API con un retardo.
    setTimeout(() => {
      // Simulación de un inicio de sesión exitoso.
      if (email === "usuario@healthstate.com" && password === "password123") {
        setMessage('¡Inicio de sesión exitoso!');
        // Aquí se redirigiría al usuario al dashboard principal.
      } else {
        // Simulación de credenciales incorrectas.
        setMessage('Error: Correo electrónico o contraseña no válidos.');
      }
      setIsLoading(false); // Desactiva el estado de carga.
    }, 2000);
  };

  // --- Renderizado del Componente ---
  // Aquí se define la estructura visual de la página usando JSX y clases de Tailwind CSS.
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Encabezado con el logo y el nombre del sistema */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-full shadow-md">
            <LockIcon />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Health State</h1>
          <p className="text-gray-500">Sistema Integrado de Gestión Hospitalaria</p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Campo para el Correo Electrónico */}
            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="su.correo@ejemplo.com"
                required
              />
            </div>

            {/* Campo para la Contraseña */}
            <div className="mb-6">
              <label className="block text-gray-600 font-medium mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:bg-blue-300"
            >
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          {/* Mensaje de estado */}
          {message && (
            <p className={`mt-6 text-center text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}

        </div>
        
        {/* Pie de página */}
        <p className="text-center text-gray-400 text-xs mt-8">
          &copy;2025 Grupo 1 servicios web UNICDA. Todos los derechos reservados.
        </p>

      </div>
    </div>
  );
}

export default App;
