import { useState } from 'react';
import { readTodos, saveTodos, todoReducer } from './todos';

export function useTodos() {
  const [state, setState] = useState(readTodos);

  function dispatch(action) {
    const todos = todoReducer(state.todos, action);
    if (todos === state.todos) return;
    const error = saveTodos(todos);
    setState({ todos, error });
  }

  return { ...state, dispatch };
}
