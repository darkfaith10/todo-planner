import { useState } from 'react';
import ScopeIcon from './ScopeIcon.jsx';
import TodoItem from './TodoItem.jsx';
import DayStrip from './DayStrip.jsx';

export default function TodoSection({
  scope,
  level,
  label,
  periodLabel,
  open,
  onToggleOpen,
  todos,
  loading,
  onAdd,
  onToggleTodo,
  onDelete,
  selectedDate,
  onDateChange,
}) {
  const [text, setText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const openTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <section className={`todo-section scope-${scope} ${open ? 'is-open' : ''}`}>
      <button className="section-header" onClick={onToggleOpen} aria-expanded={open}>
        <ScopeIcon level={level} active={open} />
        <span className="section-titles">
          <span className="section-label">{label}</span>
          <span className="section-sub">{periodLabel}</span>
        </span>
        <span className="section-meta">
          {loading ? '···' : `${openTodos.length} open${completedTodos.length ? ` · ${completedTodos.length} done` : ''}`}
        </span>
        <svg className="chevron" viewBox="0 0 24 24" width="18" height="18">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="section-body">
          {scope === 'daily' && <DayStrip selectedDate={selectedDate} onChange={onDateChange} />}

          <form className="add-row" onSubmit={submit}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Add to ${periodLabel}…`}
              aria-label={`Add a task for ${periodLabel}`}
            />
            <button type="submit">Add</button>
          </form>

          {loading ? (
            <p className="empty-note">Loading…</p>
          ) : (
            <>
              {openTodos.length === 0 ? (
                <p className="empty-note">
                  {completedTodos.length ? 'All done for this period. Nice.' : 'Nothing here yet — add your first task above.'}
                </p>
              ) : (
                <ul className="todo-list">
                  {openTodos.map((t) => (
                    <TodoItem key={t._id} todo={t} onToggle={onToggleTodo} onDelete={onDelete} />
                  ))}
                </ul>
              )}

              {completedTodos.length > 0 && (
                <div className="completed-block">
                  <button className="completed-toggle" onClick={() => setShowCompleted((v) => !v)}>
                    {showCompleted ? 'Hide' : 'Show'} completed ({completedTodos.length})
                  </button>
                  {showCompleted && (
                    <ul className="todo-list completed">
                      {completedTodos.map((t) => (
                        <TodoItem key={t._id} todo={t} onToggle={onToggleTodo} onDelete={onDelete} />
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
