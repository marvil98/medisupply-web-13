export interface Producto {
  nombre: string;
  ventas: number;
}

export interface Reporte {
  ventasTotales: number;
  pedidos: number;
  productos: Producto[];
  grafico: number[];
}

export const mockSalesData: Record<string, Record<string, Reporte>> = {
  v1: {
    bimestral: {
      ventasTotales: 25000000,
      pedidos: 72,
      productos: [
        { nombre: 'Aspirina', ventas: 10000000 },
        { nombre: 'Dolex', ventas: 15000000 },
      ],
      grafico: [6, 8, 5, 4, 7, 9],
    },
  },
  v3: {
    anual: {
      ventasTotales: 50000000,
      pedidos: 190,
      productos: [
        { nombre: 'Ibuprofeno', ventas: 20000000 },
        { nombre: 'Diclofenaco', ventas: 30000000 },
      ],
      grafico: [4, 6, 5, 7, 8, 9],
    },
  },
};
