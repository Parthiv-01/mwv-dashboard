import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ColorRule, DataSource, PolygonData, TimeRange } from '@/types/dashboard';

interface DashboardState {
  timeRange: TimeRange;
  polygons: PolygonData[];
  dataSources: DataSource[];
  selectedDataSource: string;
  isDrawing: boolean;
  polygonCounter: number;
  lastUpdated: number;
  
  setTimeRange: (range: TimeRange) => void;
  addPolygon: (polygon: PolygonData) => void;
  deletePolygon: (id: string) => void;
  updatePolygonValue: (id: string, value: number) => void;
  updatePolygonColor: (id: string, color: string) => void;
  setSelectedDataSource: (id: string) => void;
  setIsDrawing: (drawing: boolean) => void;
  updateColorRules: (dataSourceId: string, rules: ColorRule[]) => void;
  clearCache: () => void;
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

// Helper function to ensure dates are Date objects
const ensureDate = (dateValue: any): Date => {
  if (dateValue instanceof Date) {
    return dateValue;
  }
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  return new Date(); // Fallback to current date
};

// Helper function to ensure timeRange has valid dates
const normalizeTimeRange = (timeRange: any): TimeRange => {
  return {
    start: ensureDate(timeRange?.start),
    end: ensureDate(timeRange?.end),
    isRange: Boolean(timeRange?.isRange)
  };
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
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
      lastUpdated: Date.now(),

      setTimeRange: (range) => {
        const currentRange = normalizeTimeRange(get().timeRange);
        const newRange = normalizeTimeRange(range);
        
        if (
          currentRange.start.getTime() !== newRange.start.getTime() ||
          currentRange.end.getTime() !== newRange.end.getTime() ||
          currentRange.isRange !== newRange.isRange
        ) {
          set({ timeRange: newRange, lastUpdated: Date.now() });
        }
      },
      
      addPolygon: (polygon) => 
        set((state) => {
          // Validate polygon coordinates
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
            polygonCounter: newCounter,
            lastUpdated: Date.now()
          };
        }),
      
      deletePolygon: (id) =>
        set((state) => ({
          polygons: state.polygons.filter(p => p.id !== id),
          lastUpdated: Date.now()
        })),
      
      updatePolygonValue: (id, value) =>
        set((state) => {
          const currentPolygon = state.polygons.find(p => p.id === id);
          if (!currentPolygon || Math.abs((currentPolygon.currentValue || 0) - value) < 0.01) {
            return state;
          }
          
          return {
            polygons: state.polygons.map(p =>
              p.id === id ? { ...p, currentValue: value } : p
            ),
            lastUpdated: Date.now()
          };
        }),
      
      updatePolygonColor: (id, color) =>
        set((state) => {
          const currentPolygon = state.polygons.find(p => p.id === id);
          if (!currentPolygon || currentPolygon.color === color) {
            return state;
          }
          
          return {
            polygons: state.polygons.map(p =>
              p.id === id ? { ...p, color } : p
            ),
            lastUpdated: Date.now()
          };
        }),
      
      setSelectedDataSource: (id) => {
        const current = get().selectedDataSource;
        if (current !== id) {
          set({ selectedDataSource: id, lastUpdated: Date.now() });
        }
      },
      
      setIsDrawing: (drawing) => {
        const current = get().isDrawing;
        if (current !== drawing) {
          set({ isDrawing: drawing });
        }
      },
      
      updateColorRules: (dataSourceId, rules) =>
        set((state) => ({
          dataSources: state.dataSources.map(ds =>
            ds.id === dataSourceId ? { ...ds, colorRules: rules } : ds
          ),
          lastUpdated: Date.now()
        })),

      clearCache: () => {
        localStorage.removeItem('dashboard-storage');
        set({
          polygons: [],
          polygonCounter: 0,
          dataSources: defaultDataSources,
          selectedDataSource: 'openmeteo',
          timeRange: {
            start: new Date(),
            end: new Date(),
            isRange: false
          },
          lastUpdated: Date.now()
        });
      }
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        polygons: state.polygons.filter(p => 
          p.coordinates && Array.isArray(p.coordinates) && p.coordinates.length >= 3
        ),
        dataSources: state.dataSources,
        selectedDataSource: state.selectedDataSource,
        polygonCounter: state.polygonCounter,
        timeRange: {
          start: state.timeRange.start instanceof Date ? state.timeRange.start.toISOString() : new Date().toISOString(),
          end: state.timeRange.end instanceof Date ? state.timeRange.end.toISOString() : new Date().toISOString(),
          isRange: state.timeRange.isRange
        },
        lastUpdated: state.lastUpdated
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Fix timeRange dates
          if (state.timeRange) {
            state.timeRange = normalizeTimeRange(state.timeRange);
          }
          
          // Clean up invalid polygons
          if (state.polygons) {
            state.polygons = state.polygons.filter(polygon => {
              const isValid = polygon.coordinates && 
                             Array.isArray(polygon.coordinates) && 
                             polygon.coordinates.length >= 3;
              
              if (!isValid) {
                console.warn('Removing invalid polygon from cache:', polygon.id);
              }
              
              return isValid;
            });
          }
          
          console.log('Store rehydrated with', state.polygons?.length || 0, 'valid polygons');
        }
      }
    }
  )
);
