// All "anchor" helpers return the canonical start-date for a period, in
// local time, matching the todo document's `date` field:
//   daily   -> the date itself
//   weekly  -> the Monday of that week
//   monthly -> the 1st of that month
//   yearly  -> Jan 1st of that year

export function toISODate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Monday-start week, regardless of locale.
export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

export function getWeekEnd(date) {
  return addDays(getWeekStart(date), 6);
}

export function getMonthStart(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getYearStart(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), 0, 1);
}

export function isSameDay(a, b) {
  return toISODate(a) === toISODate(b);
}

export function formatDayLabel(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export function formatWeekLabel(date) {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(start);
  const endStr = new Intl.DateTimeFormat('en-US', sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' }).format(end);
  return `${startStr} – ${endStr}`;
}

export function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

export function formatYearLabel(date) {
  return String(date.getFullYear());
}
