'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { Layout } from 'antd';
import TimelineSlider from './Timeline/TimelineSlider';
import MapComponent from './Map/MapComponent';
import PolygonTools from './Map/PolygonTools';
import DataSourceSidebar from './Sidebar/DataSourceSidebar';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchWeatherData, getPolygonCentroid, applyColorRules } from '@/utils/api';

const { Content, Sider } = Layout;

const Dashboard: React.FC = () => {
  const { 
    timeRange, 
    polygons, 
    dataSources, 
    selectedDataSource,
    updatePolygonValue, 
    updatePolygonColor 
  } = useDashboardStore();
  
  const isFetchingRef = useRef(false);
  const lastUpdateRef = useRef<string>('');

  // Ensure timeRange dates are valid Date objects
  const safeTimeRange = React.useMemo(() => {
    const start = timeRange.start instanceof Date ? timeRange.start : new Date(timeRange.start);
    const end = timeRange.end instanceof Date ? timeRange.end : new Date(timeRange.end);
    
    return {
      start,
      end,
      isRange: timeRange.isRange
    };
  }, [timeRange]);

  const updatePolygonData = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    const updateKey = `${safeTimeRange.start.getTime()}-${safeTimeRange.end.getTime()}-${safeTimeRange.isRange}-${polygons.length}`;
    if (lastUpdateRef.current === updateKey) return;
    
    isFetchingRef.current = true;
    lastUpdateRef.current = updateKey;

    try {
      const currentDataSource = dataSources.find(ds => ds.id === selectedDataSource);
      if (!currentDataSource) return;

      for (const polygon of polygons) {
        const centroid = getPolygonCentroid(polygon.coordinates);

        try {
          const weatherData = await fetchWeatherData(
            centroid[0],
            centroid[1],
            safeTimeRange.start,
            safeTimeRange.end
          );

          let avgTemp = 0;
          
          if (safeTimeRange.isRange && weatherData.hourly.temperature_2m.length > 1) {
            const validTemps = weatherData.hourly.temperature_2m.filter(temp => 
              temp !== null && temp !== undefined && temp !== 0
            );
            
            if (validTemps.length > 0) {
              avgTemp = validTemps.reduce((sum, temp) => sum + temp, 0) / validTemps.length;
            } else {
              console.warn(`No valid temperature data for polygon ${polygon.id}`);
              continue;
            }
          } else {
            const singleTemp = weatherData.hourly.temperature_2m[0];
            if (singleTemp === null || singleTemp === undefined || singleTemp === 0) {
              console.warn(`Invalid temperature data for polygon ${polygon.id}: ${singleTemp}`);
              continue;
            }
            avgTemp = singleTemp;
          }

          if (avgTemp !== 0) {
            const roundedTemp = Math.round(avgTemp * 10) / 10;
            updatePolygonValue(polygon.id, roundedTemp);
            
            const newColor = applyColorRules(roundedTemp, currentDataSource.colorRules);
            updatePolygonColor(polygon.id, newColor);
          }
          
        } catch (error) {
          console.error(`Error updating polygon ${polygon.id}:`, error);
          
          const centroid = getPolygonCentroid(polygon.coordinates);
          const mockTemp = 15 + ((Math.abs(centroid[0]) + Math.abs(centroid[1])) % 25);
          const roundedMockTemp = Math.round(mockTemp * 10) / 10;
          
          updatePolygonValue(polygon.id, roundedMockTemp);
          
          const newColor = applyColorRules(roundedMockTemp, currentDataSource.colorRules);
          updatePolygonColor(polygon.id, newColor);
        }
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [safeTimeRange, polygons, dataSources, selectedDataSource, updatePolygonValue, updatePolygonColor]);

  useEffect(() => {
    if (polygons.length > 0) {
      const timeoutId = setTimeout(() => {
        updatePolygonData();
      }, 600);
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    safeTimeRange.start.getTime(), 
    safeTimeRange.end.getTime(), 
    safeTimeRange.isRange, 
    polygons.length,
    updatePolygonData
  ]);

  return (
    <Layout style={{ height: '100vh' }}>
      <Layout>
        <Content>
          <div className="flex flex-col h-full">
            <TimelineSlider />
            <div className="flex flex-1">
              <div className="flex-1 p-4">
                <MapComponent />
              </div>
              <div className="w-80 p-4">
                <PolygonTools />
              </div>
            </div>
          </div>
        </Content>
        <Sider width={320} theme="light">
          <DataSourceSidebar />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
