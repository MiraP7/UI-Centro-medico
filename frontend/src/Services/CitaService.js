// src/services/CitaService.js

class CitaService {
    constructor(baseUrl = 'https://localhost:44388/api/Cita') {
        this.baseUrl = baseUrl;
        // Se eliminan las URLs base para pacientes y médicos
        // this.pacienteBaseUrl = 'https://localhost:44388/api/Paciente';
        // this.medicoBaseUrl = 'https://localhost:44388/api/Medico';
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

    // Se eliminan los métodos getPacienteById y getMedicoById
    // async getPacienteById(id) { ... }
    // async getMedicoById(id) { ... }

    /**
     * Obtiene todas las citas de la API sin enriquecerlas con nombres de paciente/médico.
     * Solo formatea la fecha y la hora.
     * @returns {Promise<Array>} Un array de objetos Cita.
     */
    async getAllCitas() {
        try {
            // 1. Obtener todas las citas
            const citas = await this._fetchData(`${this.baseUrl}/all`);
            console.log("Citas obtenidas de la API (sin enriquecer):", citas);

            // Solo se formatea la fecha y la hora, y se asigna un estado por defecto.
            const citasFormateadas = citas.map(cita => {
                return {
                    ...cita,
                    // Estos campos ahora vendrán directamente del API o serán "Desconocido"
                    // ya que no se hace la búsqueda de nombres.
                    patient: `ID Paciente: ${cita.pacienteID}`, // Mostrar el ID del paciente directamente
                    medicoNombre: `ID Médico: ${cita.medicoID}`, // Mostrar el ID del médico directamente
                    estadoDescripcion: 'Estado Desconocido', // Por defecto, ya que no hay endpoint
                    date: cita.fechaHora ? new Date(cita.fechaHora).toLocaleDateString('es-DO') : 'N/A',
                    time: cita.fechaHora ? new Date(cita.fechaHora).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                };
            });

            return citasFormateadas;
        } catch (error) {
            console.error("Error en getAllCitas (CitaService):", error);
            throw error;
        }
    }

    async createCita(citaData) {
        try {
            const response = await fetch(`${this.baseUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(citaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la cita.');
            }
            return await response.json();
        } catch (error) {
            console.error("Error en createCita:", error);
            throw error;
        }
    }
}

export default CitaService;