'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Range } from 'react-range';
import { Button, Switch, Typography, DatePicker, Space, Card } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useDashboardStore } from '@/store/dashboardStore';
import { addDays, subDays, format, addHours, differenceInHours, startOfDay } from 'date-fns';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// Icon props for TypeScript compatibility
const iconProps = {
  onPointerEnterCapture: undefined,
  onPointerLeaveCapture: undefined
};

const TimelineSlider: React.FC = () => {
  const { setTimeRange } = useDashboardStore();
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(subDays(new Date(), 15));
  const [customEndDate, setCustomEndDate] = useState<Date>(addDays(new Date(), 15));
  const [values, setValues] = useState([360]); // Hours from start
  
  // Calculate date range and total hours based on custom date selection
  const startDate = useCustomDate ? customStartDate : subDays(new Date(), 15);
  const endDate = useCustomDate ? customEndDate : addDays(new Date(), 15);
  const totalHours = Math.max(1, differenceInHours(endDate, startDate));

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

  // Update time range when values change
  useEffect(() => {
    const timeoutId = setTimeout(updateTimeRange, 300);
    return () => clearTimeout(timeoutId);
  }, [updateTimeRange]);

  // Reset slider when custom date changes
  useEffect(() => {
    const midPoint = Math.floor(totalHours / 2);
    if (isRangeMode) {
      const quarterPoint = Math.floor(totalHours / 4);
      setValues([quarterPoint, totalHours - quarterPoint]);
    } else {
      setValues([midPoint]);
    }
  }, [useCustomDate, customStartDate, customEndDate, totalHours, isRangeMode]);

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

  const handleCustomDateChange = (checked: boolean) => {
    setUseCustomDate(checked);
    if (!checked) {
      // Reset to default ±15 days
      setCustomStartDate(subDays(new Date(), 15));
      setCustomEndDate(addDays(new Date(), 15));
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setCustomStartDate(startOfDay(dates[0].toDate()));
      setCustomEndDate(startOfDay(addDays(dates[1].toDate(), 1))); // Include full end day
    }
  };

  const formatTime = (hourIndex: number) => {
    const date = addHours(startDate, hourIndex);
    return format(date, 'MMM dd, HH:mm');
  };

  const resetToNow = () => {
    if (useCustomDate) {
      // Reset to current time within custom range
      const now = new Date();
      const nowHours = differenceInHours(now, startDate);
      const clampedNowHours = Math.max(0, Math.min(nowHours, totalHours - 1));
      
      if (isRangeMode) {
        setValues([clampedNowHours, Math.min(clampedNowHours + 24, totalHours - 1)]);
      } else {
        setValues([clampedNowHours]);
      }
    } else {
      // Reset to default now (middle of ±15 day range)
      const nowIndex = 15 * 24;
      if (isRangeMode) {
        setValues([nowIndex, nowIndex + 24]);
      } else {
        setValues([nowIndex]);
      }
    }
  };

  const presetRanges = [
    {
      label: 'Today',
      action: () => {
        const today = startOfDay(new Date());
        setCustomStartDate(today);
        setCustomEndDate(addDays(today, 1));
        setUseCustomDate(true);
      }
    },
    {
      label: 'This Week',
      action: () => {
        const today = new Date();
        const weekStart = startOfDay(subDays(today, 7));
        setCustomStartDate(weekStart);
        setCustomEndDate(addDays(today, 1));
        setUseCustomDate(true);
      }
    },
    {
      label: 'Last 30 Days',
      action: () => {
        const today = new Date();
        setCustomStartDate(startOfDay(subDays(today, 30)));
        setCustomEndDate(addDays(today, 1));
        setUseCustomDate(true);
      }
    }
  ];

  return (
    <div className="bg-white p-6 shadow-sm border-b">
      <Title level={4} className="mb-4">Timeline Control</Title>

      {/* Date Selection Mode */}
      <Card size="small" className="mb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={useCustomDate}
                onChange={handleCustomDateChange}
                checkedChildren="Custom"
                unCheckedChildren="Default (±15 days)"
              />
              <Text type="secondary">
                {useCustomDate ? 'Custom date range' : 'Default ±15 days from now'}
              </Text>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={isRangeMode}
                onChange={handleRangeModeChange}
                checkedChildren="Range"
                unCheckedChildren="Single"
              />
            </div>
          </div>

          {/* Custom Date Picker */}
          {useCustomDate && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CalendarOutlined {...iconProps} />
                <Text strong>Select Date Range:</Text>
              </div>
              
              <RangePicker
                value={[dayjs(customStartDate), dayjs(customEndDate)]}
                onChange={handleDateRangeChange}
                format="YYYY-MM-DD"
                allowClear={false}
                style={{ width: '100%' }}
              />
              
              <div className="flex gap-2">
                {presetRanges.map((preset) => (
                  <Button 
                    key={preset.label}
                    size="small" 
                    onClick={preset.action}
                    ghost
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Timeline Slider */}
      <div className="mb-4 flex justify-between items-center">
        <Text strong>
          Time Selection ({format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')})
        </Text>
        <Button onClick={resetToNow} type="primary" ghost size="small">
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

      {/* Time Display */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{format(startDate, 'MMM dd, yyyy')}</span>
        <span className="font-medium text-blue-600">
          {isRangeMode && values.length === 2
            ? `${formatTime(values[0])} → ${formatTime(values[1])}`
            : formatTime(values[0])
          }
        </span>
        <span>{format(endDate, 'MMM dd, yyyy')}</span>
      </div>

      {/* Duration Info */}
      {isRangeMode && values.length === 2 && (
        <div className="text-center">
          <Text type="secondary" style={{ fontSize: 12 }}>
            Duration: {values[1] - values[0]} hours ({Math.round((values[1] - values[0]) / 24 * 10) / 10} days)
          </Text>
        </div>
      )}

      {/* Current Selection Summary */}
      <Card size="small" className="mt-3 bg-blue-50">
        <Text type="secondary" style={{ fontSize: 11 }}>
          📅 **Current Selection:** {isRangeMode ? 'Time Range' : 'Single Point'} | 
          📊 **Mode:** {useCustomDate ? 'Custom Dates' : 'Default Range'} | 
          🕐 **Total Window:** {Math.round(totalHours / 24 * 10) / 10} days
        </Text>
      </Card>
    </div>
  );
};

export default TimelineSlider;
