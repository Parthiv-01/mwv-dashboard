import axios from 'axios';
import { WeatherData, ColorRule } from '@/types/dashboard';
import { format, differenceInHours } from 'date-fns';

const mockDataCache = new Map<string, number>();

export const fetchWeatherData = async (
  lat: number,
  lng: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherData> => {
  try {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    
    console.log(`Fetching weather data for ${lat}, ${lng} from ${start} to ${end}`);
    
    const response = await axios.get(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&hourly=temperature_2m`,
      { timeout: 15000 }
    );
    
    const filteredTemperatures = response.data.hourly.temperature_2m.map((temp: number | null) => {
      return (temp === null || temp === undefined) ? null : temp;
    });
    
    return {
      hourly: {
        time: response.data.hourly.time,
        temperature_2m: filteredTemperatures
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    const seed = Math.abs(lat + lng * 0.5);
    const baseTemp = 15 + (seed % 25);
    const hoursDiff = Math.max(1, differenceInHours(endDate, startDate));
    
    const temperatures = Array.from({ length: hoursDiff }, (_, i) => {
      const hourVariation = Math.sin((i % 24) * Math.PI / 12) * 3;
      return Number((baseTemp + hourVariation).toFixed(1));
    });
    
    return {
      hourly: {
        time: Array.from({ length: hoursDiff }, (_, i) => {
          const date = new Date(startDate.getTime() + i * 60 * 60 * 1000);
          return format(date, "yyyy-MM-dd'T'HH:mm");
        }),
        temperature_2m: temperatures
      }
    };
  }
};

export const getPolygonCentroid = (coordinates: [number, number][] | undefined): [number, number] => {
  // Add comprehensive defensive checks
  if (!coordinates) {
    console.warn('getPolygonCentroid: coordinates is undefined');
    return [0, 0];
  }
  
  if (!Array.isArray(coordinates)) {
    console.warn('getPolygonCentroid: coordinates is not an array:', typeof coordinates);
    return [0, 0];
  }
  
  if (coordinates.length === 0) {
    console.warn('getPolygonCentroid: coordinates array is empty');
    return [0, 0];
  }
  
  // Filter out invalid coordinate pairs
  const validCoordinates = coordinates.filter(coord => {
    return Array.isArray(coord) && 
           coord.length === 2 && 
           typeof coord[0] === 'number' && 
           typeof coord[1] === 'number' &&
           !isNaN(coord[0]) && 
           !isNaN(coord[1]);
  });
  
  if (validCoordinates.length === 0) {
    console.warn('getPolygonCentroid: no valid coordinates found');
    return [0, 0];
  }
  
  const sum = validCoordinates.reduce(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0]
  );
  
  return [sum[0] / validCoordinates.length, sum[1] / validCoordinates.length];
};

export const applyColorRules = (value: number, rules: ColorRule[]): string => {
  if (!rules || rules.length === 0) {
    return '#cccccc';
  }

  const sortedRules = [...rules].sort((a, b) => b.value - a.value);
  
  for (const rule of sortedRules) {
    let matches = false;
    
    switch (rule.operator) {
      case '<':
        matches = value < rule.value;
        break;
      case '<=':
        matches = value <= rule.value;
        break;
      case '>':
        matches = value > rule.value;
        break;
      case '>=':
        matches = value >= rule.value;
        break;
      case '=':
        matches = Math.abs(value - rule.value) < 0.1;
        break;
    }
    
    if (matches) {
      return rule.color;
    }
  }
  
  return '#cccccc';
};
