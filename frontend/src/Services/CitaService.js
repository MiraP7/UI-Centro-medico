// src/services/CitaService.js

class CitaService {
    constructor(baseUrl = 'https://localhost:44388/api/Cita') {
        this.baseUrl = baseUrl;
        // URLs base para pacientes y médicos (reactivadas)
        this.pacienteBaseUrl = 'https://localhost:44388/api/Paciente';
        this.medicoBaseUrl = 'https://localhost:44388/api/Medico';
    }

    // Método auxiliar para obtener datos de la API
    // Se mantiene la lógica para manejar respuestas con o sin la propiedad 'data'
    async _fetchData(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Asegúrate de tener el token si tu API lo requiere
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

    // Métodos para obtener datos de pacientes y médicos por ID
    async getPacienteById(id) {
        try {
            if (!id) {
                return { nombre: 'Paciente', apellido: 'Desconocido' };
            }

            const response = await fetch(`${this.pacienteBaseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                console.warn(`No se pudo obtener paciente con ID: ${id}`);
                return { nombre: 'Paciente', apellido: 'Desconocido' };
            }

            const pacienteData = await response.json();
            return pacienteData;
        } catch (error) {
            console.error(`Error al obtener paciente ${id}:`, error);
            return { nombre: 'Paciente', apellido: 'Desconocido' };
        }
    }

    async getMedicoById(id) {
        try {
            if (!id) {
                return { nombre: 'Médico', apellido: 'Desconocido' };
            }

            const response = await fetch(`${this.medicoBaseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                console.warn(`No se pudo obtener médico con ID: ${id}`);
                return { nombre: 'Médico', apellido: 'Desconocido' };
            }

            const medicoData = await response.json();
            return medicoData;
        } catch (error) {
            console.error(`Error al obtener médico ${id}:`, error);
            return { nombre: 'Médico', apellido: 'Desconocido' };
        }
    }

    /**
     * Obtiene todos los pacientes para los dropdowns
     * @returns {Promise<Array>} Lista de pacientes
     */
    async getAllPacientes() {
        try {
            const pacientes = await this._fetchData(`${this.pacienteBaseUrl}/all`);
            console.log("Pacientes obtenidos:", pacientes);
            return pacientes || [];
        } catch (error) {
            console.error("Error al obtener pacientes:", error);
            return [];
        }
    }

    /**
     * Obtiene todos los médicos para los dropdowns
     * @returns {Promise<Array>} Lista de médicos
     */
    async getAllMedicos() {
        try {
            const medicos = await this._fetchData(`${this.medicoBaseUrl}/all`);
            console.log("Médicos obtenidos:", medicos);
            return medicos || [];
        } catch (error) {
            console.error("Error al obtener médicos:", error);
            return [];
        }
    }

    /**
     * Obtiene todas las citas con nombres completos de pacientes y médicos.
     * Realiza consultas adicionales para resolver los nombres.
     * @returns {Promise<Array>} Un array de objetos Cita con nombres enriquecidos.
     */
    async getAllCitas() {
        try {
            // 1. Obtener todas las citas
            const citas = await this._fetchData(`${this.baseUrl}/all`);
            console.log("Citas obtenidas de la API:", citas);

            if (!Array.isArray(citas) || citas.length === 0) {
                console.warn('No se encontraron citas');
                return [];
            }

            // 2. Para cada cita, obtener datos del paciente y médico en paralelo
            const citasConNombres = await Promise.all(
                citas.map(async (cita) => {
                    const [pacienteData, medicoData] = await Promise.all([
                        this.getPacienteById(cita.pacienteId || cita.pacienteID),
                        this.getMedicoById(cita.medicoId || cita.medicoID)
                    ]);

                    // 3. Construir el objeto de cita enriquecido
                    return {
                        ...cita,
                        // Nombres completos para mostrar en la UI
                        patient: `${pacienteData.nombre} ${pacienteData.apellido}`.trim(),
                        medicoNombre: `${medicoData.nombre} ${medicoData.apellido}`.trim(),
                        // Formateo de fecha y hora
                        date: cita.fechaHora ? new Date(cita.fechaHora).toLocaleDateString('es-DO') : 'N/A',
                        time: cita.fechaHora ? new Date(cita.fechaHora).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                        // Estado (puedes mapear el estadoId si tienes un endpoint de estados)
                        estadoDescripcion: this.mapearEstado(cita.estadoId || cita.estadoID),
                    };
                })
            );

            console.log(`Se enriquecieron ${citasConNombres.length} citas con nombres completos`);
            return citasConNombres;
        } catch (error) {
            console.error("Error en getAllCitas (CitaService):", error);
            throw error;
        }
    }

    /**
     * Mapea el ID de estado a una descripción legible
     * @param {number} estadoId - ID del estado
     * @returns {string} Descripción del estado
     */
    mapearEstado(estadoId) {
        const estados = {
            100: 'Activo',
            101: 'Inactivo',
            102: 'Pendiente',
            103: 'Completado',
            104: 'Cancelado',
            105: 'Aprobado',
            106: 'Rechazado'
        };
        return estados[estadoId] || 'Estado Desconocido';
    }

    /**
     * Crea una nueva cita
     * @param {Object} citaData - Datos de la cita a crear
     * @returns {Promise<Object>} Respuesta de la API con la cita creada
     */
    async createCita(citaData) {
        try {
            // Validar datos antes de enviar
            const validatedData = this.validateCitaData(citaData);

            console.log('Creando cita con datos:', validatedData);

            const response = await fetch(`${this.baseUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(validatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la cita.');
            }

            const result = await response.json();
            console.log('Cita creada exitosamente:', result);
            return result;
        } catch (error) {
            console.error("Error en createCita:", error);
            throw error;
        }
    }

    /**
     * Obtiene una cita por su ID
     * @param {number} citaId - ID de la cita
     * @returns {Promise<Object>} Datos de la cita
     */
    async getCitaById(citaId) {
        try {
            if (!citaId) {
                throw new Error('ID de cita es requerido');
            }

            const response = await fetch(`${this.baseUrl}/${citaId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al obtener la cita con ID: ${citaId}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en getCitaById(${citaId}):`, error);
            throw error;
        }
    }

    /**
     * Actualiza una cita existente
     * @param {number} citaId - ID de la cita a actualizar
     * @param {Object} citaData - Datos actualizados de la cita
     * @returns {Promise<Object>} Respuesta de la API
     */
    async updateCita(citaId, citaData) {
        try {
            if (!citaId) {
                throw new Error('ID de cita es requerido para actualizar');
            }

            const response = await fetch(`${this.baseUrl}/${citaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(citaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al actualizar la cita con ID: ${citaId}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en updateCita(${citaId}):`, error);
            throw error;
        }
    }

    /**
     * Elimina una cita (COMENTADO - endpoint no disponible aún)
     * @param {number} citaId - ID de la cita a eliminar
     * @returns {Promise<Object>} Respuesta de la API
     */
    /*
    async deleteCita(citaId) {
        try {
            if (!citaId) {
                throw new Error('ID de cita es requerido para eliminar');
            }

            const response = await fetch(`${this.baseUrl}/${citaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al eliminar la cita con ID: ${citaId}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en deleteCita(${citaId}):`, error);
            throw error;
        }
    }
    */

    /**
     * Valida los datos de una cita antes de enviarlos
     * @param {Object} citaData - Datos de la cita a validar
     * @returns {Object} Datos validados y formateados
     */
    validateCitaData(citaData) {
        const errors = [];

        // Validaciones requeridas
        if (!citaData.pacienteId && !citaData.pacienteID) {
            errors.push('ID del paciente es requerido');
        }

        if (!citaData.medicoId && !citaData.medicoID) {
            errors.push('ID del médico es requerido');
        }

        if (!citaData.fechaHora) {
            errors.push('Fecha y hora son requeridas');
        }

        if (!citaData.motivoConsulta) {
            errors.push('Motivo de consulta es requerido');
        }

        if (errors.length > 0) {
            throw new Error(`Datos inválidos: ${errors.join(', ')}`);
        }

        // Formatear datos para envío
        return {
            pacienteId: citaData.pacienteId || citaData.pacienteID,
            medicoId: citaData.medicoId || citaData.medicoID,
            fechaHora: citaData.fechaHora,
            motivoConsulta: citaData.motivoConsulta,
            estadoId: citaData.estadoId || citaData.estadoID || 102 // Por defecto: Pendiente
        };
    }
}

export default CitaService;