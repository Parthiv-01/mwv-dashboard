'use client';

import React, { useState } from 'react';
import { Card, Button, Select, InputNumber, List, Typography, Space, Popconfirm } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DataSource, ColorRule } from '@/types/dashboard';
import { useDashboardStore } from '@/store/dashboardStore';

const { Title, Text } = Typography;
const { Option } = Select;

// Define icon props to avoid TypeScript errors
const iconProps = {
  onPointerEnterCapture: undefined,
  onPointerLeaveCapture: undefined
};

interface ColorRulesProps {
  dataSource: DataSource;
}

const colorOptions = [
  { value: '#ff4d4f', label: 'Red', desc: 'Hot/Critical' },
  { value: '#faad14', label: 'Orange', desc: 'Warm' },
  { value: '#52c41a', label: 'Green', desc: 'Normal' },
  { value: '#1890ff', label: 'Blue', desc: 'Cool' },
  { value: '#722ed1', label: 'Purple', desc: 'Cold' },
  { value: '#13c2c2', label: 'Cyan', desc: 'Very Cold' },
  { value: '#f5222d', label: 'Dark Red', desc: 'Extreme Hot' },
  { value: '#096dd9', label: 'Dark Blue', desc: 'Extreme Cold' }
];

const ColorRules: React.FC<ColorRulesProps> = ({ dataSource }) => {
  const { updateColorRules } = useDashboardStore();
  const [newRule, setNewRule] = useState<Partial<ColorRule>>({
    operator: '>=',
    value: 25,
    color: '#52c41a'
  });

  const addRule = () => {
    if (newRule.operator && newRule.value !== undefined && newRule.color) {
      const rule: ColorRule = {
        id: Date.now().toString(),
        operator: newRule.operator as ColorRule['operator'],
        value: newRule.value,
        color: newRule.color
      };
      
      updateColorRules(dataSource.id, [...dataSource.colorRules, rule]);
      setNewRule({ operator: '>=', value: 25, color: '#52c41a' });
    }
  };

  const deleteRule = (ruleId: string) => {
    const updatedRules = dataSource.colorRules.filter(rule => rule.id !== ruleId);
    updateColorRules(dataSource.id, updatedRules);
  };

  // Sort rules by value for better display
  const sortedRules = [...dataSource.colorRules].sort((a, b) => a.value - b.value);

  return (
    <Card size="small" title="Color Coding Rules">
      <div className="mb-4">
        <Text type="secondary">
          Define temperature-based color rules for polygon visualization
        </Text>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded">
        <Text strong className="block mb-2">Add New Rule</Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="flex gap-2">
            <Select
              value={newRule.operator}
              onChange={(value) => setNewRule({ ...newRule, operator: value })}
              style={{ width: 70 }}
            >
              <Option value="<">&lt;</Option>
              <Option value="<=">&lt;=</Option>
              <Option value="=">=</Option>
              <Option value=">=">&gt;=</Option>
              <Option value=">">&gt;</Option>
            </Select>
            <InputNumber
              value={newRule.value}
              onChange={(value) => setNewRule({ ...newRule, value: value || 0 })}
              placeholder="Temp °C"
              style={{ flex: 1 }}
              step={0.1}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={newRule.color}
              onChange={(value) => setNewRule({ ...newRule, color: value })}
              style={{ flex: 1 }}
            >
              {colorOptions.map(color => (
                <Option key={color.value} value={color.value}>
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2 border"
                      style={{ backgroundColor: color.value }}
                    />
                    <span>{color.label}</span>
                    <Text type="secondary" className="ml-1">({color.desc})</Text>
                  </div>
                </Option>
              ))}
            </Select>
            <Button 
              type="primary" 
              icon={<PlusOutlined {...iconProps} />} 
              onClick={addRule}
            />
          </div>
        </Space>
      </div>

      <List
        size="small"
        header={<Text strong>Active Rules ({sortedRules.length})</Text>}
        dataSource={sortedRules}
        renderItem={(rule) => (
          <List.Item
            actions={[
              <Popconfirm
                key="delete"
                title="Delete this rule?"
                onConfirm={() => deleteRule(rule.id)}
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
            <div className="flex items-center w-full">
              <div 
                className="w-5 h-5 rounded mr-3 border"
                style={{ backgroundColor: rule.color }}
              />
              <div className="flex-1">
                <Text strong>
                  Temperature {rule.operator} {rule.value}°C
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Color: {colorOptions.find(c => c.value === rule.color)?.label || 'Custom'}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
      />
      
      <div className="mt-3 p-2 bg-blue-50 rounded">
        <Text type="secondary" style={{ fontSize: 11 }}>
          💡 Rules are applied in order. More specific conditions should have higher values.
        </Text>
      </div>
    </Card>
  );
};

export default ColorRules;
