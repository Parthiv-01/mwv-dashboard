'use client';

import React, { useEffect, useCallback, useRef, useMemo } from 'react';
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

  const timeRangeStartTime = useMemo(() => timeRange.start.getTime(), [timeRange.start]);
  const timeRangeEndTime = useMemo(() => timeRange.end.getTime(), [timeRange.end]);
  const timeRangeIsRange = timeRange.isRange;
  const polygonsLength = polygons.length;

  const updatePolygonData = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    const updateKey = `${timeRangeStartTime}-${timeRangeEndTime}-${timeRangeIsRange}-${polygonsLength}`;
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
            timeRange.start,
            timeRange.end
          );

          let avgTemp = 0;
          
          if (timeRange.isRange && weatherData.hourly.temperature_2m.length > 1) {
            const validTemps = weatherData.hourly.temperature_2m.filter(temp => 
              temp !== null && temp !== undefined && temp !== 0
            );
            
            if (validTemps.length > 0) {
              avgTemp = validTemps.reduce((sum, temp) => sum + temp, 0) / validTemps.length;
            } else {
              continue;
            }
          } else {
            const singleTemp = weatherData.hourly.temperature_2m[0];
            if (singleTemp === null || singleTemp === undefined || singleTemp === 0) {
              continue;
            }
            avgTemp = singleTemp;
          }

          const roundedTemp = Math.round(avgTemp * 10) / 10;
          updatePolygonValue(polygon.id, roundedTemp);
          
          const newColor = applyColorRules(roundedTemp, currentDataSource.colorRules);
          updatePolygonColor(polygon.id, newColor);
          
        } catch (error) {
          console.error(`Error updating polygon ${polygon.id}:`, error);
          
          const mockTemp = 20 + Math.random() * 15;
          const roundedMockTemp = Math.round(mockTemp * 10) / 10;
          
          updatePolygonValue(polygon.id, roundedMockTemp);
          
          const newColor = applyColorRules(roundedMockTemp, currentDataSource.colorRules);
          updatePolygonColor(polygon.id, newColor);
        }
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [timeRange, polygons, dataSources, selectedDataSource, updatePolygonValue, updatePolygonColor, timeRangeStartTime, timeRangeEndTime, timeRangeIsRange, polygonsLength]);

  useEffect(() => {
    if (polygonsLength > 0) {
      const timeoutId = setTimeout(() => {
        updatePolygonData();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    timeRangeStartTime, 
    timeRangeEndTime, 
    timeRangeIsRange, 
    polygonsLength,
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
