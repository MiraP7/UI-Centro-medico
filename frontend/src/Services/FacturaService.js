class FacturaService {
    constructor(baseUrl = 'https://localhost:44388/api/Factura') {
        this.baseUrl = baseUrl;
        // Datos de ejemplo para simular la API
        this.facturasData = [
            {
                facturaId: 101,
                pacienteId: 1,
                pacienteNombre: 'Juan Pérez',
                fechaEmision: '2025-06-25T10:00:00Z',
                monto: 150.00,
                pagado: true,
                aseguradoraId: 1,
                descripcionTratamientoPrincipal: 'Consulta General'
            },
            {
                facturaId: 102,
                pacienteId: 2,
                pacienteNombre: 'Ana Gómez',
                fechaEmision: '2025-06-26T11:30:00Z',
                monto: 200.00,
                pagado: false,
                aseguradoraId: null,
                descripcionTratamientoPrincipal: 'Extracción Dental'
            },
            {
                facturaId: 103,
                pacienteId: 3,
                pacienteNombre: 'Pedro López',
                fechaEmision: '2025-06-27T09:15:00Z',
                monto: 85.50,
                pagado: true,
                aseguradoraId: 2,
                descripcionTratamientoPrincipal: 'Vacuna Antigripal'
            },
            {
                facturaId: 104,
                pacienteId: 1,
                pacienteNombre: 'Juan Pérez',
                fechaEmision: '2025-06-28T14:00:00Z',
                monto: 300.00,
                pagado: false,
                aseguradoraId: 1,
                descripcionTratamientoPrincipal: 'Cirugía Menor'
            },
        ];
        this.detalleFacturasData = {
            101: [
                { detalleId: 1, tratamientoId: 1, descripcion: 'Consulta General', fecha: '2025-06-20', costo: 50.00, cubierto: 30.00 },
                { detalleId: 2, tratamientoId: 2, descripcion: 'Análisis de Sangre', fecha: '2025-06-20', costo: 100.00, cubierto: 0.00 },
            ],
            102: [
                { detalleId: 3, tratamientoId: 3, descripcion: 'Extracción Dental', fecha: '2025-06-24', costo: 150.00, cubierto: 120.00 },
                { detalleId: 4, tratamientoId: 4, descripcion: 'Radiografía', fecha: '2025-06-24', costo: 50.00, cubierto: 25.00 },
            ],
            103: [
                { detalleId: 5, tratamientoId: 5, descripcion: 'Vacuna Antigripal', fecha: '2025-06-26', costo: 85.50, cubierto: 85.50 },
            ],
            104: [
                { detalleId: 6, tratamientoId: 6, descripcion: 'Cirugía Menor', fecha: '2025-06-27', costo: 250.00, cubierto: 150.00 },
                { detalleId: 7, tratamientoId: 7, descripcion: 'Sutura', fecha: '2025-06-27', costo: 50.00, cubierto: 40.00 },
            ],
        };
    }

    async getAllFacturas() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.facturasData);
            }, 500);
        });
    }

    async getDetalleFacturaByFacturaId(facturaId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const detalles = this.detalleFacturasData[facturaId];
                if (detalles) {
                    resolve(detalles);
                } else {
                    reject(new Error('Detalles de factura no encontrados.'));
                }
            }, 300);
        });
    }
}

export default FacturaService;