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

                    // Obtener roles al inicializar
                    const rolesData = await fetchRoles(token);

                    // Asegurar que el rolId esté guardado en localStorage
                    if (parsedUser.rolId) {
                        localStorage.setItem('rolId', parsedUser.rolId.toString());
                    }

                    setUser(parsedUser);
                    setIsAuthenticated(true);

                    console.log('Usuario restaurado:', parsedUser);
                    console.log('RolId guardado en localStorage:', localStorage.getItem('rolId'));
                    console.log('¿Es admin?', validateAdminRole(parsedUser.rolId, rolesData));
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

        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));

        // Asegurar que el rolId se guarde correctamente
        if (userData.rolId !== undefined && userData.rolId !== null) {
            localStorage.setItem('rolId', userData.rolId.toString());
            console.log('RolId guardado en localStorage:', userData.rolId);
        } else {
            console.warn('userData.rolId es undefined o null:', userData);
        }

        setUser(userData);
        setIsAuthenticated(true);

        console.log('Login exitoso:', userData);
        console.log('RolId en localStorage después del login:', localStorage.getItem('rolId'));
        console.log('¿Es admin?', validateAdminRole(userData.rolId, rolesData));
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
        const adminStatus = user?.rolId === 100;
        console.log('Verificando si es admin:', user?.rolId, '=== 100 ?', adminStatus);
        return adminStatus;
    };

    const isOperator = () => {
        const operatorStatus = user?.rolId !== 100;
        console.log('Verificando si es operador:', user?.rolId, '!== 100 ?', operatorStatus);
        return operatorStatus;
    };

    // Función para verificar si el usuario puede acceder a módulos de administrador
    const canAccessAdminModules = () => {
        return isAdmin();
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
        validateAdminRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
