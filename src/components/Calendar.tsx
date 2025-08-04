import React, { useState } from 'react';
import dayjs from 'dayjs';
import { X } from 'lucide-react';

interface CalendarProps {
  monthsToShow?: number;
  onClose?: () => void;
  onDateSelect?: (dates: { startDate: Date | null; endDate: Date | null }) => void;
}

const Calendar: React.FC<CalendarProps> = ({ monthsToShow = 2, onClose, onDateSelect }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const today = new Date();

  const generateMonth = (monthOffset: number) => {
    const base = dayjs(today).add(monthOffset, 'month').startOf('month');
    const daysInMonth = base.daysInMonth();
    const firstDay = base.startOf('month').day(); // 0 (Sun) - 6 (Sat)
    const totalDays = firstDay + daysInMonth;
    const totalWeeks = Math.ceil(totalDays / 7);

    const days: (Date | null)[] = Array(firstDay).fill(null);

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(base.year(), base.month(), i));
    }

    // Fill remaining days to complete the grid
    const remainingDays = totalWeeks * 7 - days.length;
    days.push(...Array(remainingDays).fill(null));

    return {
      monthLabel: base.format('MMMM YYYY'),
      days,
      weeks: totalWeeks,
    };
  };

  const handleSelectDate = (date: Date) => {
    let newStartDate = startDate;
    let newEndDate = endDate;

    if (!startDate || (startDate && endDate)) {
      newStartDate = date;
      newEndDate = null;
    } else if (date < startDate) {
      newStartDate = date;
      newEndDate = null;
    } else {
      newEndDate = date;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);

    if (onDateSelect) {
      onDateSelect({ startDate: newStartDate, endDate: newEndDate });
    }
  };

  const isSelected = (date: Date | null) => {
    if (!date || !startDate) return false;
    if (startDate && !endDate) return dayjs(date).isSame(startDate, 'day');
    return dayjs(date).isSame(startDate, 'day') || dayjs(date).isSame(endDate, 'day');
  };

  const isInRange = (date: Date | null) => {
    if (!date || !startDate || !endDate) return false;
    return dayjs(date).isAfter(startDate) && dayjs(date).isBefore(endDate);
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    if (onDateSelect) {
      onDateSelect({ startDate: null, endDate: null });
    }
  };

  const formatDateRange = () => {
    if (!startDate) return 'Select your dates';
    if (!endDate) return `${dayjs(startDate).format('MMM D')} - Select end date`;
    return `${dayjs(startDate).format('MMM D')} - ${dayjs(endDate).format('MMM D')}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close calendar"
          >
            <X size={24} className="text-gray-500" />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select dates</h2>
            <p className="text-gray-600">{formatDateRange()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: monthsToShow }, (_, i) => {
              const { monthLabel, days, weeks } = generateMonth(i);

              return (
                <div key={i} className="min-w-[280px]">
                  <h3 className="text-center font-semibold mb-6 text-gray-900">{monthLabel}</h3>
                  <div 
                    className="grid grid-cols-7 gap-1 text-center"
                    style={{ gridTemplateRows: `auto repeat(${weeks}, minmax(36px, 1fr))` }}
                  >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                      <div key={d} className="text-sm font-medium text-gray-500 h-8 flex items-center justify-center">{d}</div>
                    ))}
                    {days.map((day, idx) => {
                      const isDisabled = day ? dayjs(day).isBefore(today, 'day') : false;
                      return (
                        <div
                          key={idx}
                          className={`
                            h-9 w-9 flex items-center justify-center text-sm rounded-full mx-auto
                            ${!day ? 'invisible' : ''}
                            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
                            ${isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                            ${isInRange(day) ? 'bg-blue-50 text-blue-600' : ''}
                          `}
                          onClick={() => day && !isDisabled && handleSelectDate(day)}
                        >
                          {day ? day.getDate() : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={clearDates} 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
            >
              Clear dates
            </button>
            <button 
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Apply dates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;