export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? 'is-completed' : ''}`}>
      <button
        className="todo-check"
        onClick={() => onToggle(todo._id, !todo.completed)}
        aria-pressed={todo.completed}
        aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
      >
        <span className="check-box">
          {todo.completed && (
            <svg viewBox="0 0 16 16" width="11" height="11">
              <path
                d="M3 8l3 3 7-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="todo-text">{todo.text}</span>
      </button>
      <button className="todo-delete" onClick={() => onDelete(todo._id)} aria-label="Delete task">
        <svg viewBox="0 0 24 24" width="13" height="13">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}
