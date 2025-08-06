// src/services/AuthService.js

class AuthService {
    constructor() {
        this.baseUrl = 'https://localhost:7256/api/Auth';
    }

    /**
     * Obtiene el token de autenticación del localStorage
     * @returns {string|null} Token de autenticación
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Obtiene los datos del usuario actual del localStorage
     * @returns {Object|null} Datos del usuario
     */
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Obtiene el rol del usuario actual
     * @returns {string|null} Rol del usuario ('admin' o 'operador')
     */
    getUserRole() {
        const user = this.getCurrentUser();
        return user?.rol || null;
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} True si está autenticado
     */
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    /**
     * Verifica si el usuario tiene un rol específico
     * @param {string} role - Rol a verificar ('admin' o 'operador')
     * @returns {boolean} True si el usuario tiene el rol
     */
    hasRole(role) {
        const userRole = this.getUserRole();
        return userRole === role;
    }

    /**
     * Verifica si el usuario es administrador
     * @returns {boolean} True si es admin
     */
    isAdmin() {
        return this.hasRole('admin');
    }

    /**
     * Verifica si el usuario es operador
     * @returns {boolean} True si es operador
     */
    isOperador() {
        return this.hasRole('operador');
    }

    /**
     * Verifica si el usuario tiene acceso a una ruta específica
     * @param {string} route - Ruta a verificar
     * @returns {boolean} True si tiene acceso
     */
    hasAccessToRoute(route) {
        const userRole = this.getUserRole();
        
        // Si no hay rol, no tiene acceso
        if (!userRole) return false;

        // Admin tiene acceso a todo
        if (userRole === 'admin') return true;

        // Operador solo tiene acceso a ciertas rutas
        if (userRole === 'operador') {
            const allowedRoutes = [
                '/',
                '/home',
                '/pacientes',
                '/facturacion',
                '/autorizacion'
            ];
            return allowedRoutes.includes(route);
        }

        return false;
    }

    /**
     * Guarda los datos de autenticación
     * @param {string} token - Token de autenticación
     * @param {Object} userData - Datos del usuario
     */
    setAuthData(token, userData) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    /**
     * Cierra la sesión del usuario
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }

    /**
     * Realiza el login del usuario
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Respuesta del login
     */
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreUsuario: username,
                    contraseña: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el login');
            }

            const result = await response.json();
            
            // Guardar datos de autenticación
            this.setAuthData(result.token, result.user);
            
            return result;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Obtiene las rutas permitidas para el rol actual
     * @returns {Array} Array de rutas permitidas
     */
    getAllowedRoutes() {
        const userRole = this.getUserRole();
        
        if (userRole === 'admin') {
            return [
                { path: '/', name: 'Home', icon: 'pi pi-home' },
                { path: '/pacientes', name: 'Pacientes', icon: 'pi pi-users' },
                { path: '/facturacion', name: 'Facturación', icon: 'pi pi-money-bill' },
                { path: '/autorizacion', name: 'Autorización', icon: 'pi pi-check-square' },
                { path: '/medicos', name: 'Médicos', icon: 'pi pi-user-md' },
                { path: '/usuarios', name: 'Usuarios', icon: 'pi pi-id-card' },
                { path: '/aseguradoras', name: 'Aseguradoras', icon: 'pi pi-shield' }
            ];
        } else if (userRole === 'operador') {
            return [
                { path: '/', name: 'Home', icon: 'pi pi-home' },
                { path: '/pacientes', name: 'Pacientes', icon: 'pi pi-users' },
                { path: '/facturacion', name: 'Facturación', icon: 'pi pi-money-bill' },
                { path: '/autorizacion', name: 'Autorización', icon: 'pi pi-check-square' }
            ];
        }
        
        return [];
    }
}

export default AuthService;
