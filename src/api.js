const BASE = '/api/todos';

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with ${res.status}`);
  }
  return res.json();
}

// `date` is the period's anchor date in YYYY-MM-DD form:
//   daily -> the day itself, weekly -> that week's Monday,
//   monthly -> the 1st of the month, yearly -> Jan 1st.
export function fetchTodos(scope, date) {
  return fetch(`${BASE}?scope=${scope}&date=${date}`).then(handle);
}

export function addTodo(scope, date, text) {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, date, text }),
  }).then(handle);
}

export function updateTodo(id, updates) {
  return fetch(BASE, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  }).then(handle);
}

export function deleteTodo(id) {
  return fetch(`${BASE}?id=${id}`, { method: 'DELETE' }).then(handle);
}
