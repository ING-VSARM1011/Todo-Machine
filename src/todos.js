export const STORAGE_KEY = 'todo-machine.todos.v1';
export const MAX_TEXT_LENGTH = 200;

export function normalizeText(text) {
  return typeof text === 'string' ? text.trim().slice(0, MAX_TEXT_LENGTH) : '';
}

export function isTodoList(value) {
  return Array.isArray(value) && value.every(todo =>
    todo !== null && typeof todo === 'object' &&
    typeof todo.id === 'string' && todo.id.length > 0 &&
    typeof todo.text === 'string' && todo.text === normalizeText(todo.text) &&
    todo.text.length > 0 && typeof todo.completed === 'boolean',
  ) && new Set(value.map(todo => todo.id)).size === value.length;
}

export function readTodos() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { todos: [], error: '' };
    const todos = JSON.parse(raw);
    if (!isTodoList(todos)) throw new Error('Invalid saved tasks');
    return { todos, error: '' };
  } catch {
    return { todos: [], error: 'No se pudieron leer las tareas guardadas. Puedes continuar, pero revisa el almacenamiento del navegador.' };
  }
}

export function saveTodos(todos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return '';
  } catch {
    return 'No se pudieron guardar los cambios. Tus tareas seguirán disponibles en esta pestaña hasta que la cierres o recargues.';
  }
}

export function todoReducer(todos, action) {
  switch (action.type) {
    case 'add': {
      const text = normalizeText(action.text);
      if (!text || !action.id || todos.some(todo => todo.id === action.id)) return todos;
      return [...todos, { id: action.id, text, completed: false }];
    }
    case 'toggle':
      return todos.map(todo => todo.id === action.id ? { ...todo, completed: !todo.completed } : todo);
    case 'edit': {
      const text = normalizeText(action.text);
      if (!text) return todos;
      return todos.map(todo => todo.id === action.id ? { ...todo, text } : todo);
    }
    case 'delete':
      return todos.filter(todo => todo.id !== action.id);
    default:
      return todos;
  }
}

export function filterTodos(todos, query) {
  const search = query.trim().toLocaleLowerCase('es');
  return todos.filter(todo => todo.text.toLocaleLowerCase('es').includes(search));
}
