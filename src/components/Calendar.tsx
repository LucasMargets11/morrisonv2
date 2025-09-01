import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { X } from 'lucide-react';

dayjs.locale('es');

interface CalendarProps {
  monthsToShow?: number;
  onClose?: () => void;
  onDateSelect?: (dates: { startDate: Date | null; endDate: Date | null }) => void;
  /** NUEVO: permite abrir el calendario mostrando el rango ya elegido */
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  /** Rango(s) bloqueados (check_in_date, check_out_date exclusives) */
  blockedRanges?: { start: string | Date; end: string | Date }[];
  /** Precio base por día */
  basePrice?: number;
  /** Rangos de tarifas especiales (start_date/end_date inclusive) */
  pricingRanges?: { start_date: string; end_date: string; price: number }[];
}

const Calendar: React.FC<CalendarProps> = ({
  monthsToShow = 2,
  onClose,
  onDateSelect,
  initialStartDate = null,
  initialEndDate = null,
  blockedRanges = [],
  basePrice,
  pricingRanges = [],
}) => {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);

  // Mantener sincronizado si cambian las props iniciales
  useEffect(() => {
    setStartDate(initialStartDate ?? null);
  }, [initialStartDate]);
  useEffect(() => {
    setEndDate(initialEndDate ?? null);
  }, [initialEndDate]);

  const today = new Date();

  const generateMonth = (monthOffset: number) => {
    const base = dayjs(today).add(monthOffset, 'month').startOf('month');
    const daysInMonth = base.daysInMonth();
    const firstDay = base.startOf('month').day(); // 0-6 (Dom-Sáb)
    const totalDays = firstDay + daysInMonth;
    const totalWeeks = Math.ceil(totalDays / 7);

    const days: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(base.year(), base.month(), i));
    }
    const remainingDays = totalWeeks * 7 - days.length;
    days.push(...Array(remainingDays).fill(null));

    return {
      monthLabel: base.format('MMMM YYYY'),
      days,
      weeks: totalWeeks,
    };
  };

  const handleSelectDate = (date: Date) => {
  // Evitar seleccionar dentro de bloqueos
  if (isBlocked(date)) return;
    let newStartDate = startDate;
    let newEndDate = endDate;

    if (!startDate || (startDate && endDate)) {
      newStartDate = date;
      newEndDate = null;
    } else if (date < startDate) {
      newStartDate = date;
      newEndDate = null;
    } else {
      // Verificar que no haya bloqueos intermedios entre startDate y la fecha seleccionada
      const hasBlockedBetween = () => {
        if (!startDate) return false;
        const dStart = dayjs(startDate).startOf('day');
        const dEnd = dayjs(date).startOf('day');
        if (dEnd.isSame(dStart, 'day')) return false;
        const step = dStart.add(1, 'day');
        let cursor = step;
        while (cursor.isBefore(dEnd, 'day')) {
          if (isBlocked(cursor.toDate())) return true;
          cursor = cursor.add(1, 'day');
        }
        return false;
      };
      if (hasBlockedBetween()) {
        // Opcional: reiniciar selección para que el usuario elija nuevamente
        // newStartDate = date; newEndDate = null;
        // Simplemente no permitir cerrar el rango
        onDateSelect?.({ startDate: newStartDate, endDate: null });
        return;
      }
      newEndDate = date;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateSelect?.({ startDate: newStartDate, endDate: newEndDate });
  };

  const isSelected = (date: Date | null) => {
    if (!date || !startDate) return false;
    if (startDate && !endDate) return dayjs(date).isSame(startDate, 'day');
    return dayjs(date).isSame(startDate, 'day') || dayjs(date).isSame(endDate, 'day');
  };

  const isInRange = (date: Date | null) => {
    if (!date || !startDate || !endDate) return false;
    return dayjs(date).isAfter(startDate, 'day') && dayjs(date).isBefore(endDate, 'day');
  };

  const normalizedBlocked = blockedRanges.map(r => ({
    start: dayjs(r.start).startOf('day'),
    end: dayjs(r.end).startOf('day'),
  }));

  // check if a single date falls inside any blocked interval (inclusive start, exclusive end)
  const isBlocked = (date: Date | null) => {
    if (!date) return false;
    const d = dayjs(date).startOf('day');
    return normalizedBlocked.some(r => d.isSame(r.start) || (d.isAfter(r.start) && d.isBefore(r.end)) || d.isSame(r.end));
  };

  // Normalizar pricing ranges a objetos dayjs
  const normalizedPricing = pricingRanges.map(p => ({
    start: dayjs(p.start_date).startOf('day'),
    end: dayjs(p.end_date).startOf('day'),
    price: p.price,
  }));

  const getPriceForDate = (date: Date | null): number | null => {
    if (!date) return null;
    if (!basePrice && !normalizedPricing.length) return null;
    const d = dayjs(date).startOf('day');
    const special = normalizedPricing.find(r => (d.isSame(r.start) || d.isAfter(r.start)) && (d.isSame(r.end) || d.isBefore(r.end)));
    return special ? special.price : (basePrice ?? null);
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    onDateSelect?.({ startDate: null, endDate: null });
  };

  const formatDateRange = () => {
    if (!startDate) return 'Selecciona tus fechas';
    if (!endDate) return `${dayjs(startDate).format('D MMM')} - Selecciona fecha fin`;
    return `${dayjs(startDate).format('D MMM')} - ${dayjs(endDate).format('D MMM')}`;
  };

  // Scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const modal = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                      const isPast = day ? dayjs(day).isBefore(dayjs(today), 'day') : false;
                      const blocked = isBlocked(day);
                      const isDisabled = isPast || blocked;
                      const selected = day ? isSelected(day) : false;
                      const inRange = day ? isInRange(day) : false;
                      // Classes para el círculo o anillo reducido
                      let circleClasses = 'flex items-center justify-center rounded-full transition-colors w-7 h-7 text-[11px] font-semibold';
                      if (blocked) {
                        circleClasses += ' bg-red-500 text-white line-through';
                      } else if (selected) {
                        circleClasses += ' bg-blue-600 text-white shadow';
                      } else if (inRange) {
                        circleClasses += ' bg-blue-100 text-blue-700';
                      } else if (!isDisabled) {
                        circleClasses += ' hover:bg-blue-50';
                      } else if (isPast) {
                        circleClasses += ' text-gray-300';
                      }

                      // Para fechas habilitadas agregamos cursor pointer en el contenedor
                      return (
                        <div
                          key={idx}
                          className={`
                            relative h-12 w-12 flex flex-col items-center justify-center text-xs rounded-md mx-auto transition-all duration-150
                            ${!day ? 'invisible' : ''}
                            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          onClick={() => day && !isDisabled && handleSelectDate(day)}
                        >
                          {day && (
                            <>
                              <div className={circleClasses}>{day.getDate()}</div>
                              {!blocked && (
                                <span className={`mt-0.5 leading-none ${selected ? 'text-blue-600' : 'text-gray-500'} text-[10px]`}>
                                  ${getPriceForDate(day) ?? ''}
                                </span>
                              )}
                            </>
                          )}
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

  return createPortal(modal, document.body);
};

export default Calendar;
