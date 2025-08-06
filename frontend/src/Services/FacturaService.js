class FacturaService {
    constructor(baseUrl = 'https://localhost:7256/api/Factura') {
        this.baseUrl = baseUrl;
        // Agregamos la URL base para la API de Pacientes
        this.pacienteBaseUrl = 'https://localhost:7256/api/Paciente';
        // AÑADIDO: URL base para la API de DetalleFactura
        this.detalleFacturaBaseUrl = 'https://localhost:7256/api/DetalleFactura';
        // AÑADIDO: URL base para la API de Tratamiento
        this.tratamientoBaseUrl = 'https://localhost:7256/api/Tratamiento';
    }

    /**
     * Obtiene todos las facturas de la API.
     * @returns {Promise<Array>} Un array de objetos Factura.
     */
    async getAllFacturas() {
        try {
            const response = await fetch(`${this.baseUrl}/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Asume que necesitas token
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener las facturas.');
            }

            const result = await response.json();
            // La API puede devolver los datos directamente o dentro de una propiedad 'data'
            const facturas = result.data || result;

            // --- Lógica para obtener el nombre del paciente ---
            const facturasConNombres = await Promise.all(
                facturas.map(async (factura) => {
                    if (factura.pacienteId) {
                        try {
                            const paciente = await this.getPacienteById(factura.pacienteId);
                            // Asignamos el nombre del paciente al campo pacienteNombre
                            return { ...factura, pacienteNombre: paciente.nombre };
                        } catch (pacienteError) {
                            console.warn(`No se pudo obtener el nombre del paciente para ID ${factura.pacienteId}:`, pacienteError);
                            return { ...factura, pacienteNombre: 'Paciente Desconocido' }; // Valor predeterminado en caso de error
                        }
                    }
                    return { ...factura, pacienteNombre: 'N/A' }; // Si no hay pacienteId
                })
            );
            return facturasConNombres;
            // --- Fin de la lógica para obtener el nombre del paciente ---

        } catch (error) {
            console.error("Error en getAllFacturas:", error);
            throw error; // Re-lanza el error para que el componente que llama lo maneje
        }
    }

    /**
     * Obtiene los detalles de una factura específica por su ID.
     * AHORA busca en DetalleFactura para obtener el TratamientoID, y luego busca el Tratamiento.
     * @param {number} facturaId El ID de la factura.
     * @returns {Promise<Array>} Un array de objetos Tratamiento con el monto del detalle.
     */
    async getDetalleFacturaByFacturaId(facturaId) {
        try {
            // Paso 1: Obtener TODOS los DetalleFactura y filtrar por facturaId
            const responseDetalle = await fetch(`${this.detalleFacturaBaseUrl}/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!responseDetalle.ok) {
                const errorData = await responseDetalle.json();
                throw new Error(errorData.message || `Error al obtener detalle de factura para facturaId ${facturaId}.`);
            }

            const detalleFactura = await responseDetalle.json();
            // La API de DetalleFactura devuelve todos los detalles, necesitamos filtrar por facturaId
            let todosLosDetalles = detalleFactura.data || detalleFactura;

            // Asegurar que tenemos un array
            if (!Array.isArray(todosLosDetalles)) {
                todosLosDetalles = todosLosDetalles ? [todosLosDetalles] : [];
            }

            // Filtrar detalles que pertenecen a la factura específica
            const detallesDeLaFactura = todosLosDetalles.filter(detalle =>
                detalle.facturaId === Number(facturaId)
            );

            // Si no hay detalles para esta factura, devolvemos un array vacío
            if (detallesDeLaFactura.length === 0) {
                console.warn(`No se encontraron DetalleFactura para facturaId ${facturaId}.`);
                return [];
            }

            // Paso 2: Para cada detalle, obtener la información del tratamiento
            const tratamientosConDetalles = await Promise.all(
                detallesDeLaFactura.map(async (detalle) => {
                    if (!detalle.tratamientoId) {
                        console.warn(`DetalleFactura sin tratamientoId encontrado para facturaId ${facturaId}.`);
                        return null;
                    }

                    try {
                        const tratamiento = await this.getTratamientoById(detalle.tratamientoId);
                        return {
                            ...tratamiento,
                            montoDetalle: detalle.monto,
                            detalleFacturaId: detalle.detalleFacturaId || detalle.id
                        };
                    } catch (error) {
                        console.warn(`Error al obtener tratamiento ${detalle.tratamientoId}:`, error);
                        return null;
                    }
                })
            );

            // Filtrar los elementos nulos y devolver el resultado
            return tratamientosConDetalles.filter(item => item !== null);

        } catch (error) {
            console.error(`Error en getDetalleFacturaByFacturaId para factura ${facturaId}:`, error);
            throw error;
        }
    }

    /**
     * Registra una nueva factura.
     * @param {object} facturaData Los datos de la nueva factura.
     * @returns {Promise<object>} El objeto Factura creado.
     */
    async createFactura(facturaData) {
        try {
            const response = await fetch(`${this.baseUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(facturaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la factura.');
            }

            return await response.json();
        } catch (error) {
            console.error("Error en createFactura:", error);
            throw error;
        }
    }

    /**
     * Actualiza una factura existente.
     * @param {number} facturaId El ID de la factura a actualizar.
     * @param {object} facturaData Los datos actualizados de la factura.
     * @returns {Promise<object>} El objeto Factura actualizado.
     */
    async updateFactura(facturaId, facturaData) {
        try {
            const response = await fetch(`${this.baseUrl}/${facturaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(facturaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar la factura.');
            }

            // Dependiendo de tu API, PUT podría devolver 200 con el objeto actualizado,
            // o 204 No Content. Si es 204, no intentes parsear JSON.
            if (response.status === 204) {
                return true; // O algún indicador de éxito
            }
            return await response.json();
        } catch (error) {
            console.error(`Error en updateFactura para factura ${facturaId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina una factura por su ID.
     * @param {number} facturaId El ID de la factura a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa.
     */
    async deleteFactura(facturaId) {
        try {
            const response = await fetch(`${this.baseUrl}/${facturaId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                // Si hay un cuerpo de error, intente leerlo
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    console.warn("La respuesta de error no es JSON o está vacía.", jsonError);
                }
                throw new Error(errorData.message || `Error al eliminar la factura ${facturaId}.`);
            }

            return response.status === 204; // Devuelve true si es 204 No Content, que indica éxito
        } catch (error) {
            console.error(`Error en deleteFactura para factura ${facturaId}:`, error);
            throw error;
        }
    }

    /**
     * Registra un nuevo detalle de factura.
     * @param {object} detalleData Los datos del nuevo detalle de factura.
     * @returns {Promise<object>} El objeto DetalleFactura creado.
     */
    async createDetalleFactura(detalleData) {
        try {
            // Usar el endpoint correcto para DetalleFactura
            const response = await fetch(`${this.detalleFacturaBaseUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(detalleData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el detalle de factura.');
            }

            return await response.json();
        } catch (error) {
            console.error("Error en createDetalleFactura:", error);
            throw error;
        }
    }

    /**
     * Actualiza un detalle de factura existente.
     * @param {number} detalleId El ID del detalle a actualizar.
     * @param {object} detalleData Los datos actualizados del detalle.
     * @returns {Promise<object>} El objeto DetalleFactura actualizado.
     */
    async updateDetalleFactura(detalleId, detalleData) {
        try {
            // Asume un endpoint para actualizar detalles, por ejemplo, /api/Factura/Detalle/{detalleId}
            const response = await fetch(`${this.baseUrl}/Detalle/${detalleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(detalleData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el detalle de factura.');
            }

            if (response.status === 204) {
                return true;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error en updateDetalleFactura para detalle ${detalleId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina un detalle de factura por su ID.
     * @param {number} detalleId El ID del detalle a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa.
     */
    async deleteDetalleFactura(detalleId) {
        try {
            // Asume un endpoint para eliminar detalles, por ejemplo, /api/Factura/Detalle/{detalleId}
            const response = await fetch(`${this.baseUrl}/Detalle/${detalleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    console.warn("La respuesta de error no es JSON o está vacía.", jsonError);
                }
                throw new Error(errorData.message || `Error al eliminar el detalle de factura ${detalleId}.`);
            }

            return response.status === 204;
        } catch (error) {
            console.error(`Error en deleteDetalleFactura para detalle ${detalleId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene la información de un paciente por su ID.
     * @param {number} pacienteId El ID del paciente.
     * @returns {Promise<object>} El objeto Paciente.
     */
    async getPacienteById(pacienteId) {
        try {
            const response = await fetch(`${this.pacienteBaseUrl}/${pacienteId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al obtener el paciente con ID ${pacienteId}.`);
            }

            const result = await response.json();
            // La API de Paciente puede devolver el objeto directamente o dentro de una propiedad 'data'
            return result.data || result;
        } catch (error) {
            console.error(`Error en getPacienteById para ID ${pacienteId}:`, error);
            throw error;
        }
    }

    // AÑADIDO: Nuevo método para obtener Tratamiento por ID
    /**
     * Obtiene la información de un tratamiento por su ID.
     * @param {number} tratamientoId El ID del tratamiento.
     * @returns {Promise<object>} El objeto Tratamiento.
     */
    async getTratamientoById(tratamientoId) {
        try {
            const response = await fetch(`${this.tratamientoBaseUrl}/${tratamientoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al obtener el tratamiento con ID ${tratamientoId}.`);
            }

            const result = await response.json();
            // La API de Tratamiento puede devolver el objeto directamente o dentro de una propiedad 'data'
            return result.data || result;
        } catch (error) {
            console.error(`Error en getTratamientoById para ID ${tratamientoId}:`, error);
            throw error;
        }
    }
}

export default FacturaService;