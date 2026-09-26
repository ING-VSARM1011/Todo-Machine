import { describe, expect, it, vi } from 'vitest';
import { filterTodos, isTodoList, MAX_TEXT_LENGTH, normalizeText, readTodos, saveTodos, STORAGE_KEY, todoReducer } from './todos';

const tasks = [
  { id: 'one', text: 'Estudiar React', completed: false },
  { id: 'two', text: 'Comprar café', completed: true },
];

describe('task transitions', () => {
  it('adds trimmed text without mutating the existing list', () => {
    const result = todoReducer(tasks, { type: 'add', id: 'three', text: '  Leer  ' });
    expect(result).toEqual([...tasks, { id: 'three', text: 'Leer', completed: false }]);
    expect(tasks).toHaveLength(2);
  });
  it.each([
    { type: 'add', id: 'three', text: '  ' },
    { type: 'add', id: '', text: 'Leer' },
    { type: 'add', id: 'one', text: 'Leer' },
    { type: 'edit', id: 'one', text: '  ' },
    { type: 'unknown' },
  ])('rejects invalid or unknown actions: %j', action => {
    expect(todoReducer(tasks, action)).toBe(tasks);
  });
  it('toggles in both directions and leaves other tasks intact', () => {
    const result = todoReducer(tasks, { type: 'toggle', id: 'one' });
    expect(result[0].completed).toBe(true);
    expect(result[1]).toBe(tasks[1]);
    expect(todoReducer(result, { type: 'toggle', id: 'one' })).toEqual(tasks);
  });
  it('edits a task while preserving its ID and completed state', () => {
    expect(todoReducer(tasks, { type: 'edit', id: 'two', text: '  Comprar pan  ' }))
      .toEqual([tasks[0], { id: 'two', text: 'Comprar pan', completed: true }]);
  });
  it('deletes only the selected task', () => {
    expect(todoReducer(tasks, { type: 'delete', id: 'one' })).toEqual([tasks[1]]);
  });
  it.each(['toggle', 'edit', 'delete'])('ignores a missing target for %s', type => {
    expect(todoReducer(tasks, { type, id: 'missing', text: 'Leer' })).toEqual(tasks);
  });
  it('normalizes invalid and overly long input', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText('x'.repeat(300))).toHaveLength(MAX_TEXT_LENGTH);
  });
});

describe('search', () => {
  it('matches case-insensitively and trims whitespace', () => {
    expect(filterTodos(tasks, '  REACT ')).toEqual([tasks[0]]);
    expect(filterTodos(tasks, 'café')).toEqual([tasks[1]]);
  });
  it('returns all tasks for an empty query and none for a missing match', () => {
    expect(filterTodos(tasks, ' ')).toEqual(tasks);
    expect(filterTodos(tasks, 'missing')).toEqual([]);
  });
});

describe('local storage', () => {
  it('loads an empty list for a first visit', () => {
    expect(readTodos()).toEqual({ todos: [], error: '' });
  });
  it('saves and restores completed and pending tasks', () => {
    expect(saveTodos(tasks)).toBe('');
    expect(readTodos()).toEqual({ todos: tasks, error: '' });
  });
  it('reports malformed JSON without overwriting it', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    expect(readTodos()).toEqual({ todos: [], error: expect.stringContaining('leer') });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
  });
  it.each([null, {}, [null], [{ id: '', text: 'Task', completed: false }],
    [{ id: 'x', text: ' ', completed: false }], [{ id: 'x', text: 4, completed: false }],
    [{ id: 'x', text: 'Task', completed: 'yes' }], [tasks[0], tasks[0]],
    [{ id: 'x', text: 'x'.repeat(201), completed: false }],
  ])('rejects malformed saved data: %j', data => {
    expect(isTodoList(data)).toBe(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    expect(readTodos().error).not.toBe('');
  });
  it('handles denied reads and failed writes', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Blocked'); });
    expect(readTodos().error).toContain('leer');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    expect(saveTodos(tasks)).toContain('guardar');
  });
});
