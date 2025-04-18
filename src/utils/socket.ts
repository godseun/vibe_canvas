import { io, Socket } from 'socket.io-client';

export const initializeSocket = (): Socket => {
  const socket = io('http://localhost:3001', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('WebSocket 연결됨');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket 연결 실패:', error);
  });

  socket.on('todoUpdated', (data) => {
    // 여기서 Todo 상태를 업데이트하는 로직을 구현할 수 있습니다
    console.log('Todo가 업데이트되었습니다:', data);
  });

  return socket;
}; 