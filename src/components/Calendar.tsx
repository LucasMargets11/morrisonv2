import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { X } from 'lucide-react';

// Configurar dayjs en español
dayjs.locale('es');

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
    if (!startDate) return 'Selecciona tus fechas';
    if (!endDate) return `${dayjs(startDate).format('D MMM')} - Selecciona fecha fin`;
    return `${dayjs(startDate).format('D MMM')} - ${dayjs(endDate).format('D MMM')}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 md:p-6">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
            aria-label="Cerrar calendario"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Selecciona las fechas</h2>
            <p className="text-gray-600 text-sm">{formatDateRange()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: monthsToShow }, (_, i) => {
              const { monthLabel, days, weeks } = generateMonth(i);

              return (
                <div key={i} className="w-full">
                  <h3 className="text-center font-semibold mb-4 text-gray-900 capitalize">{monthLabel}</h3>
                  <div 
                    className="grid grid-cols-7 gap-1 text-center"
                    style={{ gridTemplateRows: `auto repeat(${weeks}, minmax(32px, 1fr))` }}
                  >
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
                      <div key={d} className="text-xs font-semibold text-gray-600 h-8 flex items-center justify-center">{d}</div>
                    ))}
                    {days.map((day, idx) => {
                      const isDisabled = day ? dayjs(day).isBefore(today, 'day') : false;
                      return (
                        <div
                          key={idx}
                          className={`
                            h-8 w-8 flex items-center justify-center text-sm rounded-md mx-auto transition-all duration-200
                            ${!day ? 'invisible' : ''}
                            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50 hover:scale-105'}
                            ${isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md scale-105' : ''}
                            ${isInRange(day) ? 'bg-blue-100 text-blue-700' : ''}
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

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button 
              onClick={clearDates} 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Limpiar fechas
            </button>
            <button 
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Aplicar fechas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;