import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  DocumentIcon,
  SpinnerIcon,
} from "../../components/common/Icons";
import AuthService from "../../Services/AuthService";
import { simulateLogin } from "../../utils/testUsers"; // Para testing
import "./Login.css";

const authService = new AuthService();

export default function Login({ onLoginSuccess }) {
  const [usuario, setUsername] = useState("");
  const [clave, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isUsernameHovered, setIsUsernameHovered] = useState(false);
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // MODO TESTING: Primero intentar con usuarios de testing
      const testResult = simulateLogin(usuario, clave);
      if (testResult.isSuccess) {
        const userData = {
          nombre: testResult.userName,
          apellido: testResult.lastName,
          email: testResult.email,
          rol: testResult.role
        };
        
        authService.setAuthData(testResult.token, userData);
        navigate('/');
        onLoginSuccess && onLoginSuccess();
        setLoading(false);
        return;
      }

      // Si no es usuario de testing, intentar con API real
      const response = await fetch("https://localhost:7256/api/Auth/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario: usuario, clave: clave }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isSuccess) {
          // Usar AuthService para guardar los datos con rol
          const userData = {
            nombre: data.userName || 'Usuario',
            apellido: data.lastName || '',
            email: data.email || '',
            rol: data.role || 'operador' // Por defecto operador si no viene el rol
          };
          
          authService.setAuthData(data.token, userData);
          
          // Navegar al dashboard
          navigate('/');
          
          onLoginSuccess && onLoginSuccess();
        } else {
          setError(
            data.message || "Credenciales incorrectas. Intente de nuevo."
          );
        }
      } else {
        setError(
          data.message || `Error en el servidor: ${response.statusText}`
        );
      }
    } catch (err) {
      console.error("Error durante el login:", err);
      setError("No se pudo conectar al servidor. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (isHovered, isFocused) => {
    let borderColor = "#e1e5e9";
    let boxShadow = "none";

    if (isFocused) {
      borderColor = "#2563eb";
      boxShadow = `0 0 0 3px rgba(59, 130, 246, 0.1)`;
    } else if (isHovered) {
      borderColor = "#a0a6b0";
    }

    return {
      borderColor: borderColor,
      boxShadow: boxShadow,
      transition: "all 0.2s ease-in-out",
    };
  };

  //NOTE: HACER QUE LOS INPUT PRESENTEN UN ERROR SIN SE ENVIAN VACIOS.
  //VERIFICAR LOS COLORES CORRECTOS Y ELEGIR UN NOMBRE PARA EL PROYECTO
  //MEJORAR LAS CARPETAS Y UTILIZAR ARQUITECTURA LIMPIA PARA LA ORGANIZACION
  //REVISAR LA CARPETA DE COMPONENTES Y VER QUE SE PUEDE MEJORAR
  // CREAR UNA CARPETA MODAL DENTRO DE LA CARPETA DE COMPONENTES
  // SACAR LA LOGICA DE NEGOCIO DEL PAGE LOGIN Y UTILIZAR UN SERVICIO
  // CREAR UN .ENV Y VERIFICAR QUE ESTE EN GITIGNORE PARA QUE NO SE SUBA AL REPOSITORIO
  // CREAR UNA VARIABLE PARA LLAMAR EL URL DE LA API PARA PROTEGER LA INFORMACION


  return (
    <div className="container-login">
      {/* Left Panel - Login Form */}
      <div className="left-panel">
        <div className="form-container">
          <div>
            <h1 className="title">Iniciar Sesión</h1>
            <p className="subtitle">
              Bienvenido al sistema de gestión hospitalaria. Ingresa con tus
              credenciales para administrar tus actividades, acceder a recursos
              internos y mantener la eficiencia del centro médico.
            </p>
          </div>

          <div>
            <div className="form-group">
              <UserIcon className="icon" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="input"
                style={{
                  ...getInputStyle(isUsernameHovered, isUsernameFocused),
                }}
                onMouseEnter={() => setIsUsernameHovered(true)}
                onMouseLeave={() => setIsUsernameHovered(false)}
                onFocus={() => setIsUsernameFocused(true)}
                onBlur={() => setIsUsernameFocused(false)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <LockIcon className="icon" />
              <input
                type="password"
                value={clave}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="input"
                style={{
                  ...getInputStyle(isPasswordHovered, isPasswordFocused),
                }}
                onMouseEnter={() => setIsPasswordHovered(true)}
                onMouseLeave={() => setIsPasswordHovered(false)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                disabled={loading}
              />
            </div>

            {error && <div className="error-message ">{error}</div>}

            {/* Información de testing */}
            <div className="test-info" style={{ 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '5px', 
              padding: '10px', 
              margin: '10px 0',
              fontSize: '12px',
              color: '#6c757d'
            }}>
              <strong>👨‍💻 Usuarios de Testing:</strong><br/>
              <strong>Admin:</strong> usuario: <code>admin</code> | clave: <code>admin123</code><br/>
              <strong>Operador:</strong> usuario: <code>operador</code> | clave: <code>operador123</code>
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="button"
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#2563eb"; // azul más oscuro al hover
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.transition = "all 0.2s ease-in-out";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#3b82f6"; // color normal
                  e.target.style.transform = "scale(1)";
                  e.target.style.transition = "all 0.2s ease-in-out";
                }
              }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SpinnerIcon className="spinner" />
                  Ingresando...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Welcome Message */}
      <div className="right-panel">
        <div className=".decorative-circle-1 "></div>
        <div className=".decorative-circle-2"></div>
        <div className=".decorative-circle-3"></div>

        <div className="right-panel-content">
          <div className="speech-bubble">
            <div className="speech-bubble-tail"></div>
            <div className="speech-bubble-text">
              El bienestar comienza desde dentro. Gracias por ser parte del
              motor del hospital.
            </div>
          </div>

          <div className="avatar">
            <div className="avatar-inner">
              <DocumentIcon
                style={{ width: "48px", height: "48px", color: "white" }}
              />
            </div>
          </div>

          <div>
            <h3 className="brand-name">Health State</h3>
            <p className="brandSubtitle">Tu salud, nuestro compromiso</p>
          </div>
        </div>
      </div>
    </div>
  );
}
