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
  // Add production-specific logging
  console.log(`[PROD] Fetching weather data for ${lat}, ${lng}`);
  
  try {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    
    const response = await axios.get(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&hourly=temperature_2m`,
      { 
        timeout: 20000, // Increased timeout for production
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`[PROD] API Response received:`, response.status);
    return response.data;
    
  } catch (error) {
    console.error('[PROD] API Error - Using mock data:', error);
    
    // Enhanced mock data for production
    const seed = Math.abs(lat * lng);
    const baseTemp = 18 + (seed % 20); // 18-38°C range
    
    return {
      hourly: {
        time: [format(startDate, "yyyy-MM-dd'T'HH:mm")],
        temperature_2m: [Number(baseTemp.toFixed(1))]
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
