// src/services/UserService.js

class UserService {
    constructor(baseUrl = 'https://localhost:44388/api/Usuario') {
        this.baseUrl = baseUrl;
    }

    // Método auxiliar para obtener datos de la API
    async _fetchData(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error en _fetchData para ${url}: Status: ${response.status}, Body: ${errorText}`);
                throw new Error(`Error ${response.status} al obtener datos de ${url}. Detalles: ${errorText.substring(0, 200)}...`);
            }

            const result = await response.json();
            // Si la URL es de "all" Y el resultado tiene 'data' que es un array, devuelve result.data.
            // De lo contrario, devuelve el resultado completo.
            if (url.endsWith('/all') && result && Array.isArray(result.data)) {
                return result.data;
            } else {
                return result;
            }
        } catch (error) {
            console.error(`Excepción en _fetchData para ${url}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene todos los usuarios
     * @returns {Promise<Array>} Lista de usuarios
     */
    async getAllUsers() {
        try {
            console.log("🔍 Solicitando usuarios del endpoint:", `${this.baseUrl}/all`);
            const result = await this._fetchData(`${this.baseUrl}/all`);
            console.log("📥 Respuesta completa del API:", result);

            // Si la respuesta tiene estructura { data: [...] }
            if (result && result.data && Array.isArray(result.data)) {
                console.log("✅ Datos extraídos del campo 'data':", result.data);
                return result.data;
            }

            // Si la respuesta es directamente un array
            if (Array.isArray(result)) {
                console.log("✅ Respuesta es array directo:", result);
                return result;
            }

            console.warn("⚠️ Formato de respuesta inesperado, devolviendo array vacío");
            return [];
        } catch (error) {
            console.error("❌ Error al obtener usuarios:", error);
            return [];
        }
    }

    /**
     * Obtiene un usuario por su ID
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} Datos del usuario
     */
    async getUserById(userId) {
        try {
            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            const response = await fetch(`${this.baseUrl}/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al obtener el usuario con ID: ${userId}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en getUserById(${userId}):`, error);
            throw error;
        }
    }

    /**
     * Crea un nuevo usuario
     * @param {Object} userData - Datos del usuario a crear
     * @returns {Promise<Object>} Respuesta de la API con el usuario creado
     */
    async createUser(userData) {
        try {
            console.log('🚀 === DETALLES DE LA PETICIÓN POST (Usuario) ===');
            console.log('📊 Datos del usuario:', userData);
            console.log('🔗 URL:', this.baseUrl);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(userData)
            });

            console.log('📡 Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response body:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || 'Error al crear el usuario.');
                } catch (parseError) {
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }
            }

            const result = await response.json();
            console.log('✅ Usuario creado exitosamente:', result);
            return result;
        } catch (error) {
            console.error("❌ Error en createUser:", error);
            throw error;
        }
    }

    /**
     * Actualiza un usuario existente
     * @param {number} userId - ID del usuario a actualizar
     * @param {Object} userData - Datos actualizados del usuario
     * @returns {Promise<Object>} Respuesta de la API
     */
    async updateUser(userId, userData) {
        try {
            if (!userId) {
                throw new Error('ID de usuario es requerido para actualizar');
            }

            console.log('🚀 === DETALLES DE LA PETICIÓN PUT (Usuario) ===');
            console.log('🔗 URL:', `${this.baseUrl}/${userId}`);
            console.log('📊 Datos enviados:', userData);

            const response = await fetch(`${this.baseUrl}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(userData)
            });

            console.log('📡 Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response body:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || `Error al actualizar el usuario con ID: ${userId}`);
                } catch (parseError) {
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }
            }

            const result = await response.json();
            console.log('✅ Usuario actualizado exitosamente:', result);
            return result;
        } catch (error) {
            console.error(`❌ Error en updateUser(${userId}):`, error);
            throw error;
        }
    }

    /**
     * Elimina un usuario
     * @param {number} userId - ID del usuario a eliminar
     * @returns {Promise<Object>} Respuesta de la API
     */
    async deleteUser(userId) {
        try {
            if (!userId) {
                throw new Error('ID de usuario es requerido para eliminar');
            }

            const response = await fetch(`${this.baseUrl}/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || `Error al eliminar el usuario con ID: ${userId}`);
                } catch (parseError) {
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }
            }

            const result = await response.json();
            console.log('✅ Usuario eliminado exitosamente:', result);
            return result;
        } catch (error) {
            console.error(`❌ Error en deleteUser(${userId}):`, error);
            throw error;
        }
    }

    /**
     * Valida los datos de un usuario antes de enviarlos
     * @param {Object} userData - Datos del usuario a validar
     * @returns {Object} Datos validados y formateados
     */
    validateUserData(userData) {
        const errors = [];

        // Validaciones requeridas
        if (!userData.nombre) {
            errors.push('Nombre es requerido');
        }

        if (!userData.apellido) {
            errors.push('Apellido es requerido');
        }

        if (!userData.email) {
            errors.push('Email es requerido');
        }

        if (!userData.nombreUsuario) {
            errors.push('Nombre de usuario es requerido');
        }

        if (!userData.contraseña && !userData.usuarioId) {
            errors.push('Contraseña es requerida para nuevos usuarios');
        }

        if (errors.length > 0) {
            throw new Error(`Datos inválidos: ${errors.join(', ')}`);
        }

        // Formatear datos para envío
        const validatedData = {
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
            nombreUsuario: userData.nombreUsuario,
            estadoId: userData.estadoId || 100 // Por defecto: Activo
        };

        // Solo incluir contraseña si se proporciona
        if (userData.contraseña) {
            validatedData.contraseña = userData.contraseña;
        }

        return validatedData;
    }
}

export default UserService;
