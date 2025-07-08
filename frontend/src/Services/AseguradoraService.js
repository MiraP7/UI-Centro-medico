class AseguradoraService {
    constructor(baseUrl = 'https://localhost:44388/api/Aseguradora') {
        this.baseUrl = baseUrl;
    }

    /**
     * Fetches all insurance companies.
     * @returns {Promise<Array>} A promise that resolves to an array of insurance companies.
     */
    async getAllAseguradoras() {
        try {
            const response = await fetch(`${this.baseUrl}/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Uncomment if authentication is needed
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to fetch all aseguradoras: ${response.status} - ${errorData.message || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching all aseguradoras:", error);
            throw error; // Re-throw to allow component to handle
        }
    }

    /**
     * Fetches an insurance company by its ID.
     * @param {string} id - The ID of the insurance company.
     * @returns {Promise<Object>} A promise that resolves to the insurance company object.
     */
    async getAseguradoraById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Uncomment if authentication is needed
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Aseguradora with ID ${id} not found.`);
                }
                const errorData = await response.json();
                throw new Error(`Failed to fetch aseguradora by ID: ${response.status} - ${errorData.message || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching aseguradora with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Creates a new insurance company.
     * @param {Object} aseguradoraData - The data for the new insurance company.
     * @param {string} aseguradoraData.nombre
     * @param {string} aseguradoraData.direccion
     * @param {string} aseguradoraData.telefono
     * @param {string} aseguradoraData.email
     * @param {string} aseguradoraData.contacto
     * @returns {Promise<Object>} A promise that resolves to the created insurance company object.
     */
    async createAseguradora(aseguradoraData) {
        try {
            const response = await fetch(this.baseUrl, { // POST usually to the base URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Uncomment if authentication is needed
                },
                body: JSON.stringify(aseguradoraData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to create aseguradora: ${response.status} - ${errorData.message || response.statusText}`);
            }

            // Depending on your API, POST might return the created object or just a success status
            return await response.json();
        } catch (error) {
            console.error("Error creating aseguradora:", error);
            throw error;
        }
    }

    /**
     * Updates an existing insurance company by its ID.
     * @param {string} id - The ID of the insurance company to update.
     * @param {Object} updatedData - The data to update the insurance company with.
     * @param {string} updatedData.nombre
     * @param {string} updatedData.direccion
     * @param {string} updatedData.telefono
     * @param {string} updatedData.email
     * @param {string} updatedData.contacto
     * @returns {Promise<Object>} A promise that resolves to the updated insurance company object or a success indicator.
     */
    async updateAseguradora(id, updatedData) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Uncomment if authentication is needed
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Aseguradora with ID ${id} not found for update.`);
                }
                const errorData = await response.json();
                throw new Error(`Failed to update aseguradora: ${response.status} - ${errorData.message || response.statusText}`);
            }

            // PUT usually returns the updated resource or just an empty success response (204 No Content)
            // Check if there's content to parse
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json();
            } else {
                return { success: true, message: `Aseguradora with ID ${id} updated successfully.` };
            }
        } catch (error) {
            console.error(`Error updating aseguradora with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Deletes an insurance company by its ID.
     * @param {string} id - The ID of the insurance company to delete.
     * @returns {Promise<Object>} A promise that resolves to a success indicator (e.g., { success: true }).
     */
    async deleteAseguradora(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Uncomment if authentication is needed
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Aseguradora with ID ${id} not found for deletion.`);
                }
                const errorData = await response.json();
                throw new Error(`Failed to delete aseguradora: ${response.status} - ${errorData.message || response.statusText}`);
            }

            // DELETE typically returns a 204 No Content or similar, meaning no JSON body.
            return { success: true, message: `Aseguradora with ID ${id} deleted successfully.` };
        } catch (error) {
            console.error(`Error deleting aseguradora with ID ${id}:`, error);
            throw error;
        }
    }
}

// --- Usage Example ---
// In your component or another service file:
// const aseguradoraService = new AseguradoraService();

// // Example: Get all aseguradoras
// async function fetchAllAndLog() {
//     try {
//         const allAseguradoras = await aseguradoraService.getAllAseguradoras();
//         console.log('All Aseguradoras:', allAseguradoras);
//     } catch (error) {
//         console.error('Failed to get all aseguradoras in example:', error.message);
//     }
// }
// fetchAllAndLog();

// // Example: Get an aseguradora by ID
// async function fetchByIdAndLog(id) {
//     try {
//         const aseguradora = await aseguradoraService.getAseguradoraById(id);
//         console.log(`Aseguradora ${id}:`, aseguradora);
//     } catch (error) {
//         console.error(`Failed to get aseguradora ${id} in example:`, error.message);
//     }
// }
// fetchByIdAndLog('some-aseguradora-id'); // Replace with an actual ID

// // Example: Create a new aseguradora
// async function createAndLog() {
//     const newAseguradoraData = {
//         nombre: "Nueva Seguros S.A.",
//         direccion: "Av. Siempre Viva 742",
//         telefono: "809-123-4567",
//         email: "info@nuevaseguros.com",
//         contacto: "Juan Perez"
//     };
//     try {
//         const created = await aseguradoraService.createAseguradora(newAseguradoraData);
//         console.log('Created Aseguradora:', created);
//     } catch (error) {
//         console.error('Failed to create aseguradora in example:', error.message);
//     }
// }
// // createAndLog(); // Uncomment to run example

// // Example: Update an aseguradora
// async function updateAndLog(id) {
//     const updatedData = {
//         nombre: "Seguros Modernos S.R.L.",
//         direccion: "Calle Falsa 123",
//         telefono: "809-765-4321",
//         email: "contacto@segurosmodernos.com",
//         contacto: "Maria Gomez"
//     };
//     try {
//         const result = await aseguradoraService.updateAseguradora(id, updatedData);
//         console.log(`Updated Aseguradora ${id}:`, result);
//     } catch (error) {
//         console.error(`Failed to update aseguradora ${id} in example:`, error.message);
//     }
// }
// // updateAndLog('ID_Aseguradora_a_actualizar'); // Uncomment and replace ID

// // Example: Delete an aseguradora
// async function deleteAndLog(id) {
//     try {
//         const result = await aseguradoraService.deleteAseguradora(id);
//         console.log(`Delete Aseguradora ${id}:`, result.message);
//     } catch (error) {
//         console.error(`Failed to delete aseguradora ${id} in example:`, error.message);
//     }
// }
// // deleteAndLog('ID_Aseguradora_a_eliminar'); // Uncomment and replace ID