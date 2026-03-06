
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check, Clock } from 'lucide-react';
import { formatDate } from '../utils';

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
  const [isOpen, setIsOpen] = useState<'presets' | 'calendar' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const presets = useMemo(() => [
    { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
    {
      label: 'Yesterday', getValue: () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return { start: date, end: date };
      }
    },
    {
      label: 'Last 7 days', getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return { start, end };
      }
    },
    {
      label: 'Last 30 days', getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
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
    {
      label: 'Last 6 months', getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        return { start, end };
      }
    },
    {
      label: 'Last year', getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        return { start, end };
      }
    },
    { label: 'All time', getValue: () => ({ start: null, end: null }) },
  ], []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (label: string) => {
    const preset = presets.find(p => p.label === label);
    if (preset) {
      const { start, end } = preset.getValue();
      onRangeChange({ start, end, label: preset.label });
      setIsOpen(null);
    }
  };

  const handleCustomApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startStr = formData.get('start') as string;
    const endStr = formData.get('end') as string;

    if (startStr && endStr) {
      onRangeChange({
        start: new Date(startStr),
        end: new Date(endStr),
        label: 'Custom range'
      });
      setIsOpen(null);
    }
  };

  const formatSimpleDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  const rangeDisplay = currentRange.start && currentRange.end
    ? `${formatSimpleDate(currentRange.start)} – ${formatSimpleDate(currentRange.end)}`
    : 'Select date';

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* SaaS Compact Trigger */}
      <div className="flex items-center h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm divide-x divide-slate-100 dark:divide-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">

        {/* Left: Preset Selector */}
        <div
          onClick={() => setIsOpen(isOpen === 'presets' ? null : 'presets')}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-l-lg"
        >
          <span className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">{currentRange.label}</span>
          <ChevronDown size={14} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen === 'presets' ? 'rotate-180' : ''}`} />
        </div>

        {/* Middle: Calendar Icon */}
        <div
          onClick={() => setIsOpen(isOpen === 'calendar' ? null : 'calendar')}
          className="px-3 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <CalendarIcon size={18} />
        </div>

        {/* Right: Date Range Text */}
        <div
          onClick={() => setIsOpen(isOpen === 'calendar' ? null : 'calendar')}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-r-lg"
        >
          <span className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap tabular-nums">{rangeDisplay}</span>
        </div>
      </div>

      {/* Dropdown 1: Quick Presets */}
      {isOpen === 'presets' && (
        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[100] py-1 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase  ">Quick Select</span>
          </div>
          {['Last 7 days', 'Last 30 days', 'Last year', 'All time'].map((label) => (
            <button
              key={label}
              onClick={() => handlePresetClick(label)}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-between"
            >
              {label}
              {currentRange.label === label && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown 2: Advanced Picker */}
      {isOpen === 'calendar' && (
        <div className="absolute right-0 mt-2 w-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-slate-800 z-[100] flex animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

          {/* Picker Left Panel: Shortcuts */}
          <div className="w-44 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 p-3 space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase   px-3 mb-2">Shortcuts</p>
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.label)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${currentRange.label === preset.label
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-black dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                {preset.label}
                {currentRange.label === preset.label && <Check size={14} />}
              </button>
            ))}
          </div>

          {/* Picker Main Content: Dual Inputs/Calendar */}
          <div className="flex-1 flex flex-col">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold">
                <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                <span>Range Selection</span>
              </div>

              <form onSubmit={handleCustomApply} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase   px-1">Start Date</label>
                    <input
                      type="date"
                      name="start"
                      required
                      defaultValue={currentRange.start?.toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase   px-1">End Date</label>
                    <input
                      type="date"
                      name="end"
                      required
                      defaultValue={currentRange.end?.toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Selected: </span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white">{rangeDisplay}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-slate-300 uppercase  "
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase   shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Subtle Footer */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30 px-8 py-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase   border-t border-slate-100 dark:border-slate-800 text-center">
              Google Analytics Inspired Precision
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
