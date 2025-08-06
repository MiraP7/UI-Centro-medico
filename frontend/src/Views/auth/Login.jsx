import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  UserIcon,
  LockIcon,
  DocumentIcon,
  SpinnerIcon,
} from "../../components/common/Icons";
import "./Login.css";

export default function Login() {
  const [usuario, setUsername] = useState("");
  const [clave, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [isUsernameHovered, setIsUsernameHovered] = useState(false);
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Paso 1: Autenticar al usuario
      const authResponse = await fetch("https://localhost:7256/api/Auth/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario: usuario, clave: clave }),
      });

      const authData = await authResponse.json();

      if (authResponse.ok && authData.isSuccess) {
        // Paso 2: Obtener información completa del usuario
        try {
          const userResponse = await fetch(`https://localhost:7256/api/Usuario/all?Search=${usuario}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authData.token}`
            }
          });

          if (userResponse.ok) {
            const userSearchResult = await userResponse.json();
            console.log("=== RESPUESTA COMPLETA DE BÚSQUEDA ===");
            console.log("Respuesta completa:", userSearchResult);
            console.log("=== FIN RESPUESTA ===");

            // El API devuelve un objeto con data que es un array
            if (userSearchResult.data && userSearchResult.data.length > 0) {
              const userData = userSearchResult.data[0]; // Tomar el primer resultado
              console.log("=== DATOS DEL USUARIO OBTENIDOS ===");
              console.log("Usuario encontrado:", userData);
              console.log("Todas las propiedades del userData:", Object.keys(userData));
              console.log("RolId obtenido:", userData.rolId);
              console.log("RolNombre obtenido:", userData.rolNombre);
              console.log("Tipo de rolId:", typeof userData.rolId);
              console.log("RolId como string:", String(userData.rolId));
              console.log("RolId como number:", Number(userData.rolId));
              console.log("Verificación rolId === 100:", userData.rolId === 100);
              console.log("Verificación Number(rolId) === 100:", Number(userData.rolId) === 100);
              console.log("=== FIN DATOS USUARIO ===");

              // Determinar el rolId basado en el rolNombre
              let rolId = null;
              if (userData.rolNombre === "Administrador") {
                rolId = 100;
              } else if (userData.rolNombre === "Operador") {
                rolId = 200; // o el código que uses para operador
              } else {
                // Si hay un rolId directo, usarlo, sino asumir operador
                rolId = userData.rolId ? Number(userData.rolId) : 200;
              }

              console.log("=== DETERMINACIÓN DEL ROL ===");
              console.log("rolNombre:", userData.rolNombre);
              console.log("rolId determinado:", rolId);
              console.log("=== FIN DETERMINACIÓN ===");

              // Crear objeto de usuario completo
              const completeUserData = {
                usuario: usuario,
                rolId: rolId, // Usar el rolId determinado
                userId: userData.usuarioId,
                nombre: userData.usuario, // Usar el campo correcto según la respuesta del API
                email: userData.email || '',
                rolNombre: userData.rolNombre, // Agregar también el nombre del rol
                // Agregar otros campos que puedas necesitar
              };

              console.log("=== DATOS COMPLETOS PARA LOGIN ===");
              console.log("completeUserData:", completeUserData);
              console.log("rolId en completeUserData:", completeUserData.rolId);
              console.log("Tipo de rolId en completeUserData:", typeof completeUserData.rolId);
              console.log("=== FIN DATOS COMPLETOS ===");

              // Usar el contexto de autenticación para hacer login
              await login(authData.token, completeUserData);
            } else {
              console.warn("No se encontraron datos de usuario en la búsqueda");
              // Si no se encuentra el usuario, usar datos básicos
              const basicUserData = {
                usuario: usuario,
                rolId: null // Se asumirá como operador si no se puede obtener
              };
              console.log("No se encontró usuario - Usando datos básicos:", basicUserData);
              await login(authData.token, basicUserData);
            }
          } else {
            console.error("Error al obtener datos de usuario:", userResponse.status, userResponse.statusText);
            // Si no se puede obtener info del usuario, usar datos básicos
            const basicUserData = {
              usuario: usuario,
              rolId: null // Se asumirá como operador si no se puede obtener
            };
            console.log("Error en API - Usando datos básicos para login:", basicUserData);
            await login(authData.token, basicUserData);
          }
        } catch (userError) {
          console.error("Error al obtener información del usuario:", userError);
          console.warn("No se pudo obtener información del usuario, usando datos básicos");
          // Fallback: usar datos básicos
          const basicUserData = {
            usuario: usuario,
            rolId: null
          };
          console.log("Catch - Usando datos básicos para login:", basicUserData);
          await login(authData.token, basicUserData);
        }
      } else {
        setError(
          authData.message || "Credenciales incorrectas. Intente de nuevo."
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
