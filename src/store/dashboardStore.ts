import { create } from 'zustand';
import { ColorRule, DataSource, PolygonData, TimeRange } from '@/types/dashboard';

interface DashboardState {
  timeRange: TimeRange;
  polygons: PolygonData[];
  dataSources: DataSource[];
  selectedDataSource: string;
  isDrawing: boolean;
  polygonCounter: number;
  
  setTimeRange: (range: TimeRange) => void;
  addPolygon: (polygon: PolygonData) => void;
  deletePolygon: (id: string) => void;
  updatePolygonValue: (id: string, value: number) => void;
  updatePolygonColor: (id: string, color: string) => void;
  setSelectedDataSource: (id: string) => void;
  setIsDrawing: (drawing: boolean) => void;
  updateColorRules: (dataSourceId: string, rules: ColorRule[]) => void;
  clearAll: () => void;
}

const defaultDataSources: DataSource[] = [
  {
    id: 'openmeteo',
    name: 'Open-Meteo Temperature',
    field: 'temperature_2m',
    apiEndpoint: 'https://archive-api.open-meteo.com/v1/archive',
    colorRules: [
      { id: '1', operator: '<', value: 0, color: '#096dd9' },
      { id: '2', operator: '<', value: 10, color: '#1890ff' },
      { id: '3', operator: '<', value: 20, color: '#13c2c2' },
      { id: '4', operator: '<', value: 25, color: '#52c41a' },
      { id: '5', operator: '<', value: 30, color: '#faad14' },
      { id: '6', operator: '>=', value: 30, color: '#ff4d4f' }
    ]
  }
];

export const useDashboardStore = create<DashboardState>((set, get) => ({
  timeRange: {
    start: new Date(),
    end: new Date(),
    isRange: false
  },
  polygons: [],
  dataSources: defaultDataSources,
  selectedDataSource: 'openmeteo',
  isDrawing: false,
  polygonCounter: 0,

  setTimeRange: (range) => set({ timeRange: range }),
  
  addPolygon: (polygon) => 
    set((state) => {
      if (!polygon.coordinates || !Array.isArray(polygon.coordinates) || polygon.coordinates.length < 3) {
        console.error('Cannot add polygon: invalid coordinates', polygon);
        return { ...state, isDrawing: false };
      }

      const newCounter = state.polygonCounter + 1;
      const polygonWithSequentialName = {
        ...polygon,
        coordinates: [...polygon.coordinates],
        name: `Polygon ${newCounter}`
      };
      
      return {
        polygons: [...state.polygons, polygonWithSequentialName],
        isDrawing: false,
        polygonCounter: newCounter
      };
    }),
  
  deletePolygon: (id) =>
    set((state) => ({
      polygons: state.polygons.filter(p => p.id !== id)
    })),
  
  updatePolygonValue: (id, value) =>
    set((state) => ({
      polygons: state.polygons.map(p =>
        p.id === id ? { ...p, currentValue: value } : p
      )
    })),
  
  updatePolygonColor: (id, color) =>
    set((state) => ({
      polygons: state.polygons.map(p =>
        p.id === id ? { ...p, color } : p
      )
    })),
  
  setSelectedDataSource: (id) => set({ selectedDataSource: id }),
  
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  
  updateColorRules: (dataSourceId, rules) =>
    set((state) => ({
      dataSources: state.dataSources.map(ds =>
        ds.id === dataSourceId ? { ...ds, colorRules: rules } : ds
      )
    })),

  clearAll: () => set({
    polygons: [],
    polygonCounter: 0,
    dataSources: defaultDataSources,
    selectedDataSource: 'openmeteo',
    timeRange: {
      start: new Date(),
      end: new Date(),
      isRange: false
    }
  })
}));
