import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);

    // Función para obtener roles desde la API
    const fetchRoles = async (token) => {
        try {
            const response = await fetch('https://localhost:7256/api/Rol/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const rolesData = await response.json();
                console.log('Roles obtenidos de la API:', rolesData);
                setRoles(rolesData);
                return rolesData;
            } else {
                console.error('Error al obtener roles:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error de red al obtener roles:', error);
            return [];
        }
    };

    // Función para validar si un rol es de administrador
    const validateAdminRole = (rolId, rolesData = roles) => {
        console.log('Validando rol:', rolId, 'contra roles:', rolesData);
        return rolId === 100;
    };

    useEffect(() => {
        // Verificar si hay un token y datos de usuario al cargar
        const initializeAuth = async () => {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');

            if (token && userData) {
                try {
                    const parsedUser = JSON.parse(userData);

                    // Normalizar el rolId al cargar desde localStorage
                    const normalizedUser = {
                        ...parsedUser,
                        rolId: parsedUser.rolId !== null && parsedUser.rolId !== undefined ? Number(parsedUser.rolId) : null
                    };

                    console.log('=== INICIALIZANDO DESDE LOCALSTORAGE ===');
                    console.log('parsedUser original:', parsedUser);
                    console.log('normalizedUser:', normalizedUser);
                    console.log('rolId normalizado:', normalizedUser.rolId, 'tipo:', typeof normalizedUser.rolId);
                    console.log('=== FIN INICIALIZACIÓN ===');

                    // Obtener roles al inicializar
                    const rolesData = await fetchRoles(token);

                    // Asegurar que el rolId esté guardado en localStorage
                    if (normalizedUser.rolId !== null && normalizedUser.rolId !== undefined) {
                        localStorage.setItem('rolId', normalizedUser.rolId.toString());
                    }

                    setUser(normalizedUser);
                    setIsAuthenticated(true);

                    console.log('Usuario restaurado:', normalizedUser);
                    console.log('RolId guardado en localStorage:', localStorage.getItem('rolId'));
                    console.log('¿Es admin?', validateAdminRole(normalizedUser.rolId, rolesData));
                } catch (error) {
                    console.error('Error al parsear datos de usuario:', error);
                    // Limpiar datos corruptos
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('rolId');
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (token, userData) => {
        // Obtener roles al hacer login
        const rolesData = await fetchRoles(token);

        // Normalizar el rolId para asegurar que sea un número
        const normalizedUserData = {
            ...userData,
            rolId: userData.rolId !== null && userData.rolId !== undefined ? Number(userData.rolId) : null
        };

        console.log('=== NORMALIZANDO DATOS DE USUARIO ===');
        console.log('userData original:', userData);
        console.log('normalizedUserData:', normalizedUserData);
        console.log('rolId original:', userData.rolId, 'tipo:', typeof userData.rolId);
        console.log('rolId normalizado:', normalizedUserData.rolId, 'tipo:', typeof normalizedUserData.rolId);
        console.log('=== FIN NORMALIZACIÓN ===');

        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(normalizedUserData));

        // Asegurar que el rolId se guarde correctamente
        if (normalizedUserData.rolId !== undefined && normalizedUserData.rolId !== null) {
            localStorage.setItem('rolId', normalizedUserData.rolId.toString());
            console.log('RolId guardado en localStorage:', normalizedUserData.rolId);
        } else {
            console.warn('normalizedUserData.rolId es undefined o null:', normalizedUserData);
        }

        setUser(normalizedUserData);
        setIsAuthenticated(true);

        console.log('Login exitoso:', normalizedUserData);
        console.log('RolId en localStorage después del login:', localStorage.getItem('rolId'));
        console.log('¿Es admin?', validateAdminRole(normalizedUserData.rolId, rolesData));
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('usuario');
        localStorage.removeItem('clave');
        localStorage.removeItem('rolId');
        setUser(null);
        setIsAuthenticated(false);
        setRoles([]);
    };

    const isAdmin = () => {
        const rolId = user?.rolId;
        console.log('=== VERIFICANDO ADMIN ===');
        console.log('User object completo:', user);
        console.log('RolId del usuario:', rolId);
        console.log('Tipo de rolId:', typeof rolId);
        console.log('RolId desde localStorage:', localStorage.getItem('rolId'));

        // Verificación directa con 100
        const isAdminResult = rolId === 100;
        console.log('Resultado isAdmin (rolId === 100):', isAdminResult);
        console.log('=== FIN VERIFICACIÓN ADMIN ===');

        return isAdminResult;
    };

    const isOperator = () => {
        const rolId = user?.rolId;
        const operatorStatus = rolId !== 100;
        console.log('Verificando si es operador:', rolId, '!== 100 ?', operatorStatus);
        return operatorStatus;
    };

    // Función para verificar si el usuario puede acceder a módulos de administrador
    const canAccessAdminModules = () => {
        return isAdmin();
    };

    // Función para debug del estado de autenticación
    const debugAuthState = () => {
        console.log('=== DEBUG AUTH STATE ===');
        console.log('User object:', user);
        console.log('RolId from user:', user?.rolId);
        console.log('RolNombre from user:', user?.rolNombre);
        console.log('RolId type:', typeof user?.rolId);
        console.log('RolId from localStorage:', localStorage.getItem('rolId'));
        console.log('UserData from localStorage:', localStorage.getItem('userData'));
        console.log('AuthToken:', localStorage.getItem('authToken'));
        console.log('IsAuthenticated:', isAuthenticated);
        console.log('IsAdmin result:', isAdmin());
        console.log('User?.rolId === 100:', user?.rolId === 100);
        console.log('=== END DEBUG ===');
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        roles,
        login,
        logout,
        isAdmin,
        isOperator,
        canAccessAdminModules,
        fetchRoles,
        validateAdminRole,
        debugAuthState
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
