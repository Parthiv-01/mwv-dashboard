'use client';

import React from 'react';
import { Card, Select, Typography, Button } from 'antd';
import { useDashboardStore } from '@/store/dashboardStore';
import ColorRules from './ColorRules';

const { Title } = Typography;
const { Option } = Select;

const DataSourceSidebar: React.FC = () => {
  const { dataSources, selectedDataSource, setSelectedDataSource, clearAll } = useDashboardStore();

  const currentDataSource = dataSources.find(ds => ds.id === selectedDataSource);

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <Title level={4}>Data Sources</Title>
      
      <Card size="small" className="mb-4">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Active Data Source</label>
          <Select
            value={selectedDataSource}
            onChange={setSelectedDataSource}
            style={{ width: '100%' }}
          >
            {dataSources.map(ds => (
              <Option key={ds.id} value={ds.id}>
                {ds.name}
              </Option>
            ))}
          </Select>
        </div>
        
        {currentDataSource && (
          <div>
            <label className="block text-sm font-medium mb-1">Field</label>
            <Select
              value={currentDataSource.field}
              style={{ width: '100%' }}
              disabled
            >
              <Option value={currentDataSource.field}>
                {currentDataSource.field}
              </Option>
            </Select>
          </div>
        )}
      </Card>

      {currentDataSource && (
        <div className="mb-4">
          <ColorRules dataSource={currentDataSource} />
        </div>
      )}

      <Card size="small">
        <Button 
          danger 
          block 
          onClick={clearAll}
        >
          Clear All Data
        </Button>
      </Card>
    </div>
  );
};

export default DataSourceSidebar;
