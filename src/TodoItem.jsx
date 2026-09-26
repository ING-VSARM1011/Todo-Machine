import { useState } from 'react';
import { MAX_TEXT_LENGTH } from './todos';

export function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);

  function submit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    onEdit(todo.id, draft);
    setEditing(false);
  }

  return (
    <li className={todo.completed ? 'todo-item completed' : 'todo-item'}>
      {editing ? (
        <form className="edit-form" onSubmit={submit}>
          <label className="sr-only" htmlFor={`edit-${todo.id}`}>Editar tarea</label>
          <input id={`edit-${todo.id}`} value={draft} maxLength={MAX_TEXT_LENGTH} autoFocus
            onChange={event => setDraft(event.target.value)} required />
          <button type="submit" disabled={!draft.trim()}>Guardar</button>
          <button type="button" className="secondary" onClick={() => setEditing(false)}>Cancelar</button>
        </form>
      ) : (
        <>
          <label className="todo-label">
            <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
            <span>{todo.text}</span>
          </label>
          <div className="item-actions">
            <button type="button" className="secondary" aria-label={`Editar ${todo.text}`}
              onClick={() => { setDraft(todo.text); setEditing(true); }}>Editar</button>
            <button type="button" className="danger" aria-label={`Eliminar ${todo.text}`}
              onClick={() => onDelete(todo.id)}>Eliminar</button>
          </div>
        </>
      )}
    </li>
  );
}
