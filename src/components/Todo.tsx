'use client';

import { useState, useEffect } from 'react';
import { initializeSocket } from '@/utils/socket';
import { Socket } from 'socket.io-client';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = initializeSocket();
    setSocket(socketInstance);

    socketInstance.on('todos:update', (updatedTodos: Todo[]) => {
      setTodos(updatedTodos);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !socket) return;

    socket.emit('todos:add', { text: newTodo });
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    if (!socket) return;
    socket.emit('todos:toggle', { id });
  };

  const deleteTodo = (id: string) => {
    if (!socket) return;
    socket.emit('todos:delete', { id });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">할 일 목록</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="새로운 할 일을 입력하세요"
          className="border p-2 rounded mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          추가
        </button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-2"
            />
            <span className={todo.completed ? 'line-through' : ''}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="ml-2 text-red-500"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 