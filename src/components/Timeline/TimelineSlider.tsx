'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Range } from 'react-range';
import { Button, Switch, Typography } from 'antd';
import { useDashboardStore } from '@/store/dashboardStore';
import { addDays, subDays, format, addHours } from 'date-fns';

const { Text } = Typography;

const TimelineSlider: React.FC = () => {
  const { setTimeRange } = useDashboardStore();
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [values, setValues] = useState([360]); // Hours from start (15 days * 24 hours = 360)
  
  const startDate = subDays(new Date(), 15);
  const endDate = addDays(new Date(), 15);
  const totalHours = 30 * 24; // 30 days * 24 hours

  const updateTimeRange = useCallback(() => {
    if (isRangeMode && values.length === 2) {
      const start = addHours(startDate, Math.min(values[0], values[1]));
      const end = addHours(startDate, Math.max(values[0], values[1]));
      setTimeRange({
        start,
        end,
        isRange: true
      });
    } else {
      const current = addHours(startDate, values[0]);
      setTimeRange({
        start: current,
        end: current,
        isRange: false
      });
    }
  }, [values, isRangeMode, startDate, setTimeRange]);

  useEffect(() => {
    const timeoutId = setTimeout(updateTimeRange, 500);
    return () => clearTimeout(timeoutId);
  }, [updateTimeRange]);

  const handleRangeModeChange = (checked: boolean) => {
    setIsRangeMode(checked);
    if (checked && values.length === 1) {
      const currentValue = values[0];
      const secondValue = Math.min(currentValue + 24, totalHours - 1);
      setValues([currentValue, secondValue]);
    } else if (!checked && values.length === 2) {
      setValues([values[0]]);
    }
  };

  const formatTime = (hourIndex: number) => {
    const date = addHours(startDate, hourIndex);
    return format(date, 'MMM dd, HH:mm');
  };

  const resetToNow = () => {
    const nowIndex = 15 * 24;
    if (isRangeMode) {
      setValues([nowIndex, Math.min(nowIndex + 24, totalHours - 1)]);
    } else {
      setValues([nowIndex]);
    }
  };

  return (
    <div className="bg-white p-6 shadow-sm border-b">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <Text strong>Timeline Control</Text>
          <div className="mt-2">
            <Switch
              checked={isRangeMode}
              onChange={handleRangeModeChange}
              checkedChildren="Range"
              unCheckedChildren="Single"
            />
          </div>
        </div>
        <Button onClick={resetToNow} type="primary" ghost>
          Reset to Now
        </Button>
      </div>

      <div className="mb-4">
        <Range
          step={1}
          min={0}
          max={totalHours - 1}
          values={values}
          onChange={(newValues) => {
            if (isRangeMode && newValues.length === 2) {
              const sortedValues = [...newValues].sort((a, b) => a - b);
              setValues(sortedValues);
            } else {
              setValues(newValues);
            }
          }}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="w-full h-2 bg-gray-200 rounded"
              style={props.style}
            >
              {children}
            </div>
          )}
          renderThumb={({ props, index }) => (
            <div
              {...props}
              className={`w-6 h-6 rounded-full shadow-lg cursor-pointer ${
                isRangeMode && index === 1 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={props.style}
            />
          )}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>{format(startDate, 'MMM dd, yyyy')}</span>
        <span className="font-medium">
          {isRangeMode && values.length === 2
            ? `${formatTime(values[0])} → ${formatTime(values[1])}`
            : formatTime(values[0])
          }
        </span>
        <span>{format(endDate, 'MMM dd, yyyy')}</span>
      </div>

      {isRangeMode && values.length === 2 && (
        <div className="text-center mt-2">
          <Text type="secondary" style={{ fontSize: 12 }}>
            Duration: {values[1] - values[0]} hours ({Math.round((values[1] - values[0]) / 24 * 10) / 10} days)
          </Text>
        </div>
      )}
    </div>
  );
};

export default TimelineSlider;
