export interface ColorRule {
  id: string;
  operator: '=' | '<' | '>' | '<=' | '>=';
  value: number;
  color: string;
}

export interface DataSource {
  id: string;
  name: string;
  field: string;
  apiEndpoint: string;
  colorRules: ColorRule[];
}

export interface PolygonData {
  id: string;
  coordinates: [number, number][];
  dataSourceId: string;
  currentValue: number | null;
  color: string;
  name: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  isRange: boolean;
}

export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

// Add this empty export to ensure the file is treated as a module
export {};
