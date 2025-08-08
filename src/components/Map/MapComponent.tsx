'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useDashboardStore } from '@/store/dashboardStore';
import { PolygonData } from '@/types/dashboard';
import 'leaflet/dist/leaflet.css';

const createNumberIcon = (number: string) => {
  return L.divIcon({
    html: `
      <div style="
        background: #1890ff;
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
      ">
        ${number}
      </div>
    `,
    className: 'polygon-number-label',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const ColoredPolygon: React.FC<{ polygon: PolygonData }> = ({ polygon }) => {
  const polygonRef = useRef<any>(null);

  useEffect(() => {
    if (polygonRef.current) {
      const leafletPolygon = polygonRef.current;
      leafletPolygon.setStyle({
        color: polygon.color,
        fillColor: polygon.color,
        fillOpacity: 0.6,
        weight: 3,
        opacity: 0.8
      });
    }
  }, [polygon.color]);

  if (!polygon.coordinates || !Array.isArray(polygon.coordinates) || polygon.coordinates.length === 0) {
    return null;
  }

  return (
    <Polygon
      ref={polygonRef}
      positions={polygon.coordinates}
      pathOptions={{
        color: polygon.color,
        fillColor: polygon.color,
        fillOpacity: 0.6,
        weight: 3,
        opacity: 0.8
      }}
    />
  );
};

const PolygonNumberLabel: React.FC<{ polygon: PolygonData }> = ({ polygon }) => {
  const getCentroid = (coordinates: [number, number][] | undefined): [number, number] | null => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
      return null;
    }
    
    const validCoordinates = coordinates.filter(coord => {
      return Array.isArray(coord) && 
             coord.length === 2 && 
             typeof coord[0] === 'number' && 
             typeof coord[1] === 'number' &&
             !isNaN(coord[0]) && 
             !isNaN(coord[1]);
    });
    
    if (validCoordinates.length === 0) {
      return null;
    }
    
    const sum = validCoordinates.reduce(
      (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
      [0, 0]
    );
    
    return [sum[0] / validCoordinates.length, sum[1] / validCoordinates.length];
  };

  const centroid = getCentroid(polygon.coordinates);
  
  if (!centroid) {
    return null;
  }

  const polygonNumber = polygon.name.replace(/^Polygon\s*/, '') || '?';
  const icon = createNumberIcon(polygonNumber);

  return (
    <Marker
      position={centroid}
      icon={icon}
    />
  );
};

const PolygonDrawer: React.FC = () => {
  const { isDrawing, addPolygon, selectedDataSource, setIsDrawing, polygons } = useDashboardStore();
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);

  useMapEvents({
    click: (e) => {
      if (!isDrawing) return;

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      const updatedPoints = [...currentPoints, newPoint];
      
      setCurrentPoints(updatedPoints);

      if (updatedPoints.length >= 3) {
        if (updatedPoints.length === 12) {
          finishPolygon(updatedPoints);
        }
      }
    },
    contextmenu: (e) => {
      e.originalEvent.preventDefault();
      if (isDrawing && currentPoints.length >= 3) {
        finishPolygon(currentPoints);
      }
    }
  });

  const finishPolygon = (points: [number, number][]) => {
    if (!points || points.length < 3) {
      console.error('Cannot create polygon: insufficient points', points);
      return;
    }

    const polygonNumber = polygons.length + 1;
    
    const newPolygon: PolygonData = {
      id: Date.now().toString(),
      coordinates: [...points],
      dataSourceId: selectedDataSource,
      currentValue: null,
      color: '#1890ff',
      name: `Polygon ${polygonNumber}`
    };
    
    addPolygon(newPolygon);
    setCurrentPoints([]);
  };

  return currentPoints.length > 0 ? (
    <Polygon 
      positions={currentPoints}
      pathOptions={{
        color: "#ff4d4f",
        fillColor: "#ff4d4f",
        fillOpacity: 0.3,
        weight: 2
      }}
    />
  ) : null;
};

const MapComponent: React.FC = () => {
  const { polygons } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-96 bg-gray-200 animate-pulse" />;
  }

  const validPolygons = polygons.filter(polygon => {
    const isValid = polygon.coordinates && 
                   Array.isArray(polygon.coordinates) && 
                   polygon.coordinates.length > 0;
    return isValid;
  });

  return (
    <div className="h-96 w-full relative">
      <MapContainer
        center={[22.5726, 88.3639]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <PolygonDrawer />
        
        {validPolygons.map((polygon) => (
          <ColoredPolygon 
            key={polygon.id} 
            polygon={polygon} 
          />
        ))}
        
        {validPolygons.map((polygon) => (
          <PolygonNumberLabel 
            key={`label-${polygon.id}`}
            polygon={polygon}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
