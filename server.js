const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 프로젝트별 캔버스 방 관리
const canvasRooms = new Map();

io.on('connection', (socket) => {
  console.log('클라이언트가 연결되었습니다.');

  socket.on('join_canvas', ({ projectId }) => {
    socket.join(`canvas_${projectId}`);
    console.log(`클라이언트가 캔버스 ${projectId}에 참여했습니다.`);
  });

  socket.on('leave_canvas', ({ projectId }) => {
    socket.leave(`canvas_${projectId}`);
    console.log(`클라이언트가 캔버스 ${projectId}에서 나갔습니다.`);
  });

  socket.on('draw', ({ projectId, drawingData }) => {
    // 같은 캔버스에 있는 다른 클라이언트들에게 드로잉 데이터 전송
    socket.to(`canvas_${projectId}`).emit('draw', drawingData);
  });

  socket.on('disconnect', () => {
    console.log('클라이언트가 연결을 해제했습니다.');
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 