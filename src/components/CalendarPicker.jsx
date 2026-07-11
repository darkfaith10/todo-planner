import { useEffect, useRef, useState } from 'react';
import { isSameDay } from '../dateUtils.js';

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function CalendarPicker({ selectedDate, onSelect }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const popRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (popRef.current && !popRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  useEffect(() => {
    if (open) setViewMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [open, selectedDate]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const today = new Date();

  return (
    <div className="calendar-picker" ref={popRef}>
      <button
        className={`calendar-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Pick a date"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width="19" height="19">
          <rect x="3.25" y="5" width="17.5" height="15.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.25 9.5h17.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="calendar-pop" role="dialog" aria-label="Choose a date">
          <div className="calendar-pop-header">
            <button
              className="calendar-nav-btn"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewMonth)}</span>
            <button
              className="calendar-nav-btn"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="calendar-grid calendar-weekdays" aria-hidden="true">
            {WEEKDAY_LABELS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {cells.map((date, i) =>
              date ? (
                <button
                  key={i}
                  className={`calendar-day ${isSameDay(date, selectedDate) ? 'is-selected' : ''} ${
                    isSameDay(date, today) ? 'is-today' : ''
                  }`}
                  onClick={() => {
                    onSelect(date);
                    setOpen(false);
                  }}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span key={i} />
              )
            )}
          </div>

          <button
            className="calendar-today-btn"
            onClick={() => {
              onSelect(new Date());
              setOpen(false);
            }}
          >
            Jump to today
          </button>
        </div>
      )}
    </div>
  );
}
