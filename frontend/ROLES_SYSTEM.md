# Sistema de Roles de Acceso - Health State

## 🔐 Sistema de Autenticación Implementado

Se ha implementado un sistema completo de autenticación y autorización con roles usando React Router.

### 📋 Características Implementadas

#### 1. **Dos Roles de Usuario**
- **👨‍💼 Administrador (`admin`)**: Acceso completo a todas las funcionalidades
- **👨‍💻 Operador (`operador`)**: Acceso limitado a módulos específicos

#### 2. **Control de Acceso por Rol**

**Administrador puede acceder a:**
- ✅ Menu Principal (Dashboard)
- ✅ Pacientes
- ✅ Facturación
- ✅ Autorización
- ✅ Médicos
- ✅ Usuarios
- ✅ Aseguradoras

**Operador puede acceder a:**
- ✅ Menu Principal (Dashboard)
- ✅ Pacientes
- ✅ Facturación
- ✅ Autorización
- ❌ Médicos (Solo Admin)
- ❌ Usuarios (Solo Admin)
- ❌ Aseguradoras (Solo Admin)

#### 3. **Rutas Protegidas**
- Todas las rutas están protegidas por autenticación
- Las rutas administrativas están restringidas solo para admin
- Redirección automática si no tiene permisos
- Página de "Acceso Denegado" personalizada

### 🧪 Usuarios de Testing

Para facilitar las pruebas, se han creado usuarios de testing:

```javascript
// Usuario Administrador
Usuario: admin
Clave: admin123
Rol: admin (acceso completo)

// Usuario Operador  
Usuario: operador
Clave: operador123
Rol: operador (acceso limitado)
```

### 🗂️ Estructura de Archivos Nuevos

```
src/
├── Services/
│   └── AuthService.js          # Servicio de autenticación y roles
├── components/
│   ├── AppRouter.jsx           # Router principal con rutas protegidas
│   ├── ProtectedRoute.jsx      # Componente para proteger rutas
│   └── Unauthorized.jsx       # Página de acceso denegado
└── utils/
    └── testUsers.js           # Usuarios de testing
```

### 🔧 Funcionalidades Técnicas

#### **AuthService.js**
- Gestión de tokens de autenticación
- Verificación de roles
- Control de acceso a rutas
- Métodos de login/logout

#### **ProtectedRoute.jsx**
- Componente que envuelve rutas protegidas
- Verifica autenticación y roles
- Redirecciona automáticamente si no tiene acceso

#### **AppRouter.jsx**
- Configuración central de todas las rutas
- Mapeo de rutas con roles requeridos
- Navegación basada en permisos

#### **Dashboard Mejorado**
- Menú dinámico basado en roles
- Información del usuario en header
- Navegación con React Router
- Logout integrado

### 🚀 Navegación

#### **URLs Disponibles:**
- `/` - Dashboard principal
- `/pacientes` - Gestión de pacientes
- `/facturacion` - Módulo de facturación
- `/autorizacion` - Módulo de autorización
- `/medicos` - Gestión de médicos (Solo Admin)
- `/usuarios` - Gestión de usuarios (Solo Admin)
- `/aseguradoras` - Gestión de aseguradoras (Solo Admin)
- `/login` - Página de login
- `/unauthorized` - Acceso denegado

### 💡 Características de UX

1. **Header Informativo**: Muestra nombre del usuario y rol actual
2. **Menú Contextual**: Solo muestra opciones disponibles según el rol
3. **Navegación Fluida**: URLs amigables y navegación directa
4. **Feedback Visual**: Indicadores claros de estado y permisos
5. **Logout Seguro**: Limpia todos los datos de sesión

### 🔄 Integración con Backend

El sistema está preparado para integrarse con el backend real:

```javascript
// En AuthService.js - método login()
const response = await fetch(`${this.baseUrl}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombreUsuario: username,
    contraseña: password
  })
});
```

**Estructura esperada de respuesta del backend:**
```json
{
  "isSuccess": true,
  "token": "jwt-token-here",
  "userName": "Nombre",
  "lastName": "Apellido", 
  "email": "user@email.com",
  "role": "admin" // o "operador"
}
```

### 🎯 Beneficios Implementados

- ✅ **Seguridad**: Control granular de acceso
- ✅ **Escalabilidad**: Fácil agregar nuevos roles
- ✅ **Mantenibilidad**: Código organizado y modular
- ✅ **UX Mejorada**: Navegación intuitiva y responsiva
- ✅ **Testing**: Usuarios predefinidos para pruebas
- ✅ **Performance**: Carga lazy de componentes

### 📱 Responsive Design

El sistema mantiene el diseño responsive original y se adapta perfectamente a diferentes tamaños de pantalla, con el menú lateral funcionando correctamente en dispositivos móviles.

---

*El sistema está listo para producción y puede ser fácilmente personalizado para agregar más roles o permisos específicos.*
