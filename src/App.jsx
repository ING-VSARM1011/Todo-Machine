import { useState } from 'react';
import { TodoCounter } from './TodoCounter';
import { TodoSearch } from './TodoSearch';
import { TodoList } from './TodoList';
import { TodoItem } from './TodoItem';
import { useTodos } from './useTodos';
import { filterTodos, MAX_TEXT_LENGTH } from './todos';
import './App.css';

export default function App() {
  const { todos, error, dispatch } = useTodos();
  const [query, setQuery] = useState('');
  const [text, setText] = useState('');
  const visibleTodos = filterTodos(todos, query);

  function addTodo(event) {
    event.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: 'add', id: crypto.randomUUID(), text });
    setText('');
  }

  return (
    <main className="App">
      <header>
        <p className="eyebrow">TODO MACHINE</p>
        <TodoCounter total={todos.length} completed={todos.filter(todo => todo.completed).length} />
        <p className="intro">Un pendiente a la vez. Organiza tu día a tu ritmo.</p>
      </header>
      {error && <p role="alert" className="storage-error">{error}</p>}
      <form className="add-form" onSubmit={addTodo}>
        <label htmlFor="new-todo">Nueva tarea</label>
        <div className="input-row">
          <input id="new-todo" value={text} maxLength={MAX_TEXT_LENGTH}
            onChange={event => setText(event.target.value)} placeholder="¿Qué quieres hacer?" required />
          <button type="submit" disabled={!text.trim()}>Agregar</button>
        </div>
      </form>
      <TodoSearch value={query} onChange={setQuery} />
      <p className="result-count" role="status">{visibleTodos.length} tareas visibles</p>
      {todos.length === 0 ? <p className="empty-state">Aún no tienes tareas. Agrega la primera.</p>
        : visibleTodos.length === 0 ? <p className="empty-state">No hay tareas que coincidan con tu búsqueda.</p>
        : <TodoList>
          {visibleTodos.map(todo => <TodoItem key={todo.id} todo={todo}
            onToggle={id => dispatch({ type: 'toggle', id })}
            onDelete={id => dispatch({ type: 'delete', id })}
            onEdit={(id, nextText) => dispatch({ type: 'edit', id, text: nextText })} />)}
        </TodoList>}
      <footer>Las tareas se guardan solo en este navegador. No hay sincronización entre dispositivos.</footer>
    </main>
  );
}
