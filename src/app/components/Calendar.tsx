import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toDateStr } from '../lib/scheduling';

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface CalendarProps {
  /** Determina se o dia pode ser clicado */
  isDayEnabled: (dateStr: string) => boolean;
  /** Estilo extra por dia (ex.: marcar dias bloqueados no admin) */
  dayClassName?: (dateStr: string) => string;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
}

export function Calendar({ isDayEnabled, dayClassName, selectedDate, onSelectDate }: CalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = firstDayOfMonth.getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Não permite navegar para meses anteriores ao atual
  const canGoPrev = viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth > now.getMonth());

  const todayStr = toDateStr(now);

  const cells: (string | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toDateStr(new Date(viewYear, viewMonth, i + 1))
    ),
  ];

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="font-semibold text-foreground">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />;
          const enabled = isDayEnabled(dateStr);
          const selected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={!enabled}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'aspect-square rounded-lg text-sm flex items-center justify-center transition-colors',
                enabled
                  ? 'text-foreground font-medium bg-primary/10 hover:bg-primary/25 cursor-pointer'
                  : 'text-muted-foreground/40 cursor-default',
                isToday && 'ring-1 ring-primary/50',
                selected && 'bg-primary text-primary-foreground hover:bg-primary',
                dayClassName?.(dateStr)
              )}
            >
              {Number(dateStr.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
