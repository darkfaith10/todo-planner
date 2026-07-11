import { useCallback, useEffect, useMemo, useState } from 'react';
import TodoSection from './components/TodoSection.jsx';
import CalendarPicker from './components/CalendarPicker.jsx';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './api.js';
import {
  toISODate,
  getWeekStart,
  getMonthStart,
  getYearStart,
  formatDayLabel,
  formatWeekLabel,
  formatMonthLabel,
  formatYearLabel,
} from './dateUtils.js';

const SCOPES = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'This Week' },
  { key: 'monthly', label: 'This Month' },
  { key: 'yearly', label: 'This Year' },
];

const INITIAL_OPEN = { daily: true, weekly: false, monthly: false, yearly: false };

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [todos, setTodos] = useState({ daily: [], weekly: [], monthly: [], yearly: [] });
  const [loadingMap, setLoadingMap] = useState({ daily: true, weekly: true, monthly: true, yearly: true });
  const [openScopes, setOpenScopes] = useState(INITIAL_OPEN);
  const [error, setError] = useState(null);

  // The anchor date for each scope — this is what gets sent to the API and
  // stored on each todo, so a task always belongs to a specific day, the
  // Monday of a specific (Mon–Sun) week, the 1st of a specific month, or
  // Jan 1st of a specific year.
  const anchors = useMemo(
    () => ({
      daily: toISODate(selectedDate),
      weekly: toISODate(getWeekStart(selectedDate)),
      monthly: toISODate(getMonthStart(selectedDate)),
      yearly: toISODate(getYearStart(selectedDate)),
    }),
    [selectedDate]
  );

  const periodLabels = useMemo(
    () => ({
      daily: formatDayLabel(selectedDate),
      weekly: formatWeekLabel(selectedDate),
      monthly: formatMonthLabel(selectedDate),
      yearly: formatYearLabel(selectedDate),
    }),
    [selectedDate]
  );

  const loadScope = useCallback((scope, date) => {
    setLoadingMap((prev) => ({ ...prev, [scope]: true }));
    fetchTodos(scope, date)
      .then((data) => setTodos((prev) => ({ ...prev, [scope]: data })))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMap((prev) => ({ ...prev, [scope]: false })));
  }, []);

  // Each scope only refetches when *its own* anchor date changes, so
  // stepping a day forward/back doesn't needlessly reload the week/month/
  // year lists unless you actually crossed into a new one.
  useEffect(() => {
    loadScope('daily', anchors.daily);
  }, [anchors.daily, loadScope]);

  useEffect(() => {
    loadScope('weekly', anchors.weekly);
  }, [anchors.weekly, loadScope]);

  useEffect(() => {
    loadScope('monthly', anchors.monthly);
  }, [anchors.monthly, loadScope]);

  useEffect(() => {
    loadScope('yearly', anchors.yearly);
  }, [anchors.yearly, loadScope]);

  const toggleOpen = (key) => setOpenScopes((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleAdd = useCallback(
    async (scope, text) => {
      const date = anchors[scope];
      const tempId = `temp-${Date.now()}`;
      const optimistic = { _id: tempId, scope, date, text, completed: false, createdAt: new Date().toISOString() };
      setTodos((prev) => ({ ...prev, [scope]: [optimistic, ...prev[scope]] }));
      try {
        const saved = await addTodo(scope, date, text);
        setTodos((prev) => ({
          ...prev,
          [scope]: prev[scope].map((t) => (t._id === tempId ? saved : t)),
        }));
      } catch (err) {
        setError(err.message);
        setTodos((prev) => ({ ...prev, [scope]: prev[scope].filter((t) => t._id !== tempId) }));
      }
    },
    [anchors]
  );

  const handleToggle = useCallback(async (scope, id, completed) => {
    setTodos((prev) => ({
      ...prev,
      [scope]: prev[scope].map((t) => (t._id === id ? { ...t, completed } : t)),
    }));
    try {
      await updateTodo(id, { completed });
    } catch (err) {
      setError(err.message);
      setTodos((prev) => ({
        ...prev,
        [scope]: prev[scope].map((t) => (t._id === id ? { ...t, completed: !completed } : t)),
      }));
    }
  }, []);

  const handleDelete = useCallback(
    async (scope, id) => {
      const prevList = todos[scope];
      setTodos((prev) => ({ ...prev, [scope]: prev[scope].filter((t) => t._id !== id) }));
      try {
        await deleteTodo(id);
      } catch (err) {
        setError(err.message);
        setTodos((prev) => ({ ...prev, [scope]: prevList }));
      }
    },
    [todos]
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <span className="app-eyebrow">Vijay's planner</span>
            <h1 className="app-title">TODO</h1>
          </div>
          <CalendarPicker selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>
        <p className="app-sub">Fail Fast, Move Fast</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <main className="rail-layout">
        <div className="scope-rail" aria-hidden="true">
          <div className="rail-line" />
          {SCOPES.map((s, i) => (
            <div key={s.key} className={`rail-node rail-node-${i} ${openScopes[s.key] ? 'is-active' : ''}`} />
          ))}
        </div>

        <div className="sections">
          {SCOPES.map((s, i) => (
            <TodoSection
              key={s.key}
              scope={s.key}
              level={i}
              label={s.label}
              periodLabel={periodLabels[s.key]}
              open={openScopes[s.key]}
              onToggleOpen={() => toggleOpen(s.key)}
              todos={todos[s.key]}
              loading={loadingMap[s.key]}
              onAdd={(text) => handleAdd(s.key, text)}
              onToggleTodo={(id, completed) => handleToggle(s.key, id, completed)}
              onDelete={(id) => handleDelete(s.key, id)}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
