import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import App from './App';
import { STORAGE_KEY } from './todos';

function mountApp() {
  return render(<StrictMode><App /></StrictMode>);
}
async function add(user, text) {
  await user.type(screen.getByLabelText('Nueva tarea'), text);
  await user.click(screen.getByRole('button', { name: 'Agregar' }));
}

describe('Todo Machine', () => {
  it('shows an accessible empty state and prevents blank tasks', async () => {
    const user = userEvent.setup();
    mountApp();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('0 de 0');
    expect(screen.getByText(/Agrega la primera/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
    await user.type(screen.getByLabelText('Nueva tarea'), '   ');
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('creates, completes, reopens and restores a task after remounting', async () => {
    const user = userEvent.setup();
    const view = mountApp();
    await add(user, '  Aprender Vite  ');
    expect(screen.getByLabelText('Nueva tarea')).toHaveValue('');
    const checkbox = screen.getByRole('checkbox', { name: 'Aprender Vite' });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByRole('heading')).toHaveTextContent('1 de 1');
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    view.unmount();
    mountApp();
    expect(screen.getByRole('checkbox', { name: 'Aprender Vite' })).toBeChecked();
    expect(screen.getByRole('heading')).toHaveTextContent('1 de 1');
  });

  it('searches tasks without changing totals or deleting hidden tasks', async () => {
    const user = userEvent.setup();
    mountApp();
    await add(user, 'Aprender React');
    await add(user, 'Comprar café');
    await user.type(screen.getByLabelText('Buscar tareas'), ' REACT ');
    expect(screen.getByRole('list', { name: 'Lista de tareas' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('heading')).toHaveTextContent('0 de 2');
    await user.clear(screen.getByLabelText('Buscar tareas'));
    await user.type(screen.getByLabelText('Buscar tareas'), 'inexistente');
    expect(screen.getByText(/No hay tareas que coincidan/)).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Buscar tareas'));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('edits, cancels edits and rejects empty replacement text', async () => {
    const user = userEvent.setup();
    mountApp();
    await add(user, 'Estudiar');
    await user.click(screen.getByRole('button', { name: 'Editar Estudiar' }));
    await user.clear(screen.getByLabelText('Editar tarea'));
    await user.type(screen.getByLabelText('Editar tarea'), '   ');
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
    await user.clear(screen.getByLabelText('Editar tarea'));
    await user.type(screen.getByLabelText('Editar tarea'), 'Estudiar Vite');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByRole('checkbox', { name: 'Estudiar Vite' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Editar Estudiar Vite' }));
    await user.type(screen.getByLabelText('Editar tarea'), ' descartado');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Editar Estudiar Vite' }));
    expect(screen.getByLabelText('Editar tarea')).toHaveValue('Estudiar Vite');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].text).toBe('Estudiar Vite');
  });

  it('deletes by ID even when task names are identical', async () => {
    const user = userEvent.setup();
    mountApp();
    await add(user, 'Leer');
    await add(user, 'Leer');
    const first = screen.getAllByRole('listitem')[0];
    await user.click(within(first).getByRole('button', { name: 'Eliminar Leer' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Eliminar Leer' }));
    expect(screen.getByText(/Agrega la primera/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([]);
  });

  it('keeps tasks in memory and warns if storage fails, then recovers', async () => {
    const user = userEvent.setup();
    mountApp();
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    await add(user, 'Conservar en memoria');
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron guardar');
    expect(screen.getByRole('checkbox', { name: 'Conservar en memoria' })).toBeInTheDocument();
    write.mockRestore();
    await user.click(screen.getByRole('checkbox'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].completed).toBe(true);
  });

  it('reports corrupt saved data and allows a fresh task', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, 'broken');
    mountApp();
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron leer');
    await add(user, 'Nueva tarea válida');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders task text as text rather than executing HTML', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'html', text: '<img src=x onerror=alert(1)>', completed: false }]));
    const { container } = mountApp();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
});
