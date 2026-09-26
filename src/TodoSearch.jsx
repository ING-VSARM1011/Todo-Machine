export function TodoSearch({ value, onChange }) {
  return (
    <div className="search">
      <label htmlFor="todo-search">Buscar tareas</label>
      <input id="todo-search" type="search" placeholder="Por ejemplo: estudiar React"
        value={value} onChange={event => onChange(event.target.value)} />
    </div>
  );
}
