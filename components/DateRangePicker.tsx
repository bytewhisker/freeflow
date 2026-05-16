
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

export type DateRange = {
  start: Date | null;
  end: Date | null;
  label: string;
};

interface DateRangePickerProps {
  currentRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ currentRange, onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(currentRange.start);
  const [tempEnd, setTempEnd] = useState<Date | null>(currentRange.end);
  const [viewDate, setViewDate] = useState(new Date(currentRange.start || new Date()));
  const [tempLabel, setTempLabel] = useState(currentRange.label);
  const containerRef = useRef<HTMLDivElement>(null);

  const presets = useMemo(() => [
    {
      label: 'Yesterday', getValue: () => {
        const d = new Date(); d.setDate(d.getDate() - 1);
        return { start: d, end: d };
      }
    },
    {
      label: 'Last 7 days', getValue: () => {
        const end = new Date(); const start = new Date();
        start.setDate(start.getDate() - 7);
        return { start, end };
      }
    },
    {
      label: 'Last 28 days', getValue: () => {
        const end = new Date(); const start = new Date();
        start.setDate(start.getDate() - 28);
        return { start, end };
      }
    },
    {
      label: 'Last 90 days', getValue: () => {
        const end = new Date(); const start = new Date();
        start.setDate(start.getDate() - 90);
        return { start, end };
      }
    },
    {
      label: 'This week', getValue: () => {
        const end = new Date(); const start = new Date();
        start.setDate(start.getDate() - start.getDay());
        return { start, end };
      }
    },
    {
      label: 'This month', getValue: () => {
        const end = new Date(); const start = new Date(end.getFullYear(), end.getMonth(), 1);
        return { start, end };
      }
    },
    {
      label: 'This year', getValue: () => {
        const end = new Date(); const start = new Date(end.getFullYear(), 0, 1);
        return { start, end };
      }
    },
    {
      label: 'Last week', getValue: () => {
        const end = new Date(); end.setDate(end.getDate() - end.getDay() - 1);
        const start = new Date(end); start.setDate(start.getDate() - 6);
        return { start, end };
      }
    },
    {
      label: 'Last month', getValue: () => {
        const date = new Date();
        const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        const end = new Date(date.getFullYear(), date.getMonth(), 0);
        return { start, end };
      }
    },
    { label: 'Custom', getValue: () => ({ start: tempStart, end: tempEnd }) },
  ], [tempStart, tempEnd]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePresetClick = (label: string) => {
    setTempLabel(label);
    if (label !== 'Custom') {
      const preset = presets.find(p => p.label === label);
      if (preset) {
        const { start, end } = preset.getValue();
        setTempStart(start);
        setTempEnd(end);
      }
    }
  };

  const handleDateClick = (date: Date) => {
    setTempLabel('Custom');
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
    } else {
      if (date < tempStart) {
        setTempEnd(tempStart);
        setTempStart(date);
      } else {
        setTempEnd(date);
      }
    }
  };

  const isSelected = (date: Date) => {
    if (tempStart && date.getTime() === tempStart.getTime()) return 'start';
    if (tempEnd && date.getTime() === tempEnd.getTime()) return 'end';
    if (tempStart && tempEnd && date > tempStart && date < tempEnd) return 'in-range';
    return null;
  };

  const handleUpdate = () => {
    onRangeChange({ start: tempStart, end: tempEnd, label: tempLabel });
    setIsOpen(false);
  };

  const renderCalendar = (monthOffset: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
    const firstDay = new Date(year, date.getMonth(), 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, date.getMonth(), i));

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          {monthOffset === 0 ? (
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ChevronLeft size={14} className="text-slate-400 dark:text-slate-500" />
            </button>
          ) : <div className="w-6" />}
          <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{monthName} {year}</h4>
          {monthOffset === 1 ? (
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
            </button>
          ) : <div className="w-6" />}
        </div>
        <div className="grid grid-cols-7 text-center mb-0.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} className="text-[9px] font-bold text-slate-400 dark:text-slate-500 py-1">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="h-7" />;
            const status = isSelected(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`h-7 w-full flex items-center justify-center text-[10.5px] font-bold transition-all relative
                  ${status === 'start' ? 'bg-blue-600 text-white rounded-l-md z-10' : ''}
                  ${status === 'end' ? 'bg-blue-600 text-white rounded-r-md z-10' : ''}
                  ${status === 'in-range' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md'}
                  ${status === 'start' && tempEnd ? 'rounded-r-none' : ''}
                  ${status === 'end' && tempStart ? 'rounded-l-none' : ''}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const formatShortDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm px-4 gap-3 cursor-pointer hover:border-blue-500/50 transition-all group"
      >
        <CalendarIcon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
        <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
          {currentRange.label === 'Custom' && currentRange.start && currentRange.end
            ? `${currentRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} – ${currentRange.end.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}`
            : currentRange.label}
        </span>
        <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[530px] bg-white dark:bg-slate-900 rounded-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 z-[100] flex animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          {/* Sidebar Presets */}
          <div className="w-[135px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-2.5 space-y-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.label)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${tempLabel === preset.label ? 'border-blue-600 bg-white dark:bg-slate-900' : 'border-slate-300 dark:border-slate-700'}`}>
                  {tempLabel === preset.label && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </div>
                <span className={`text-[11px] font-bold whitespace-nowrap ${tempLabel === preset.label ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Main Calendar Content */}
          <div className="flex-1 flex flex-col pt-4 px-4 pb-4 bg-white dark:bg-slate-900">
            <div className="flex-1 grid grid-cols-2 gap-6">
              {renderCalendar(0)}
              {renderCalendar(1)}
            </div>

            {/* Footer Area */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500" readOnly />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Compare</span>
                  </div>
                  <div className="relative group">
                    <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600">
                      <span>Custom</span>
                      <ChevronDown size={10} className="text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 min-w-[90px] text-center">
                    {tempStart ? tempStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Start'}
                  </div>
                  <span className="text-slate-300 dark:text-slate-700 font-bold">-</span>
                  <div className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 min-w-[90px] text-center">
                    {tempEnd ? tempEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'End'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500">Times in AST</p>
                <div className="flex gap-2">
                  <button onClick={() => setIsOpen(false)} className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleUpdate} className="px-6 py-1.5 bg-[#0070c0] text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
