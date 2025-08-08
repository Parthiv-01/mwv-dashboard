'use client';

import React from 'react';
import { Button, List, Typography, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDashboardStore } from '@/store/dashboardStore';

const { Text } = Typography;

const iconProps = {
  onPointerEnterCapture: undefined,
  onPointerLeaveCapture: undefined
};

const PolygonTools: React.FC = () => {
  const { polygons, isDrawing, setIsDrawing, deletePolygon } = useDashboardStore();

  return (
    <div className="bg-white p-4 border rounded-lg">
      <div className="mb-4">
        <Button 
          type="primary" 
          onClick={() => setIsDrawing(!isDrawing)}
          disabled={isDrawing}
          block
        >
          {isDrawing ? 'Drawing... (Right-click to finish)' : 'Draw Polygon'}
        </Button>
      </div>

      <div>
        <Text strong className="block mb-2">Active Polygons ({polygons.length})</Text>
        <List
          size="small"
          dataSource={polygons}
          renderItem={(polygon) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="delete"
                  title="Delete this polygon?"
                  onConfirm={() => deletePolygon(polygon.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    size="small" 
                    danger 
                    icon={<DeleteOutlined {...iconProps} />} 
                  />
                </Popconfirm>
              ]}
            >
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: polygon.color }}
                />
                <div>
                  <Text>{polygon.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Value: {polygon.currentValue?.toFixed(1) || 'Loading...'}°C
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default PolygonTools;
