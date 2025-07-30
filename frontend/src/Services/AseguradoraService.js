class AseguradoraService {
    constructor(baseUrl = 'https://localhost:5185/api/Aseguradora') {
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