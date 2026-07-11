import { addDays, formatDayLabel, isSameDay } from '../dateUtils.js';

export default function DayStrip({ selectedDate, onChange }) {
  const prev = addDays(selectedDate, -1);
  const next = addDays(selectedDate, 1);
  const today = new Date();

  return (
    <div className="day-strip">
      <button className="day-strip-side" onClick={() => onChange(prev)} aria-label={`Go to ${formatDayLabel(prev)}`}>
        <span className="day-strip-arrow">‹</span>
        <span className="day-strip-label">{formatDayLabel(prev)}</span>
      </button>

      <div className="day-strip-current">
        <span className="day-strip-main">{formatDayLabel(selectedDate)}</span>
        {isSameDay(selectedDate, today) && <span className="day-strip-badge">Today</span>}
      </div>

      <button className="day-strip-side" onClick={() => onChange(next)} aria-label={`Go to ${formatDayLabel(next)}`}>
        <span className="day-strip-label">{formatDayLabel(next)}</span>
        <span className="day-strip-arrow">›</span>
      </button>
    </div>
  );
}
