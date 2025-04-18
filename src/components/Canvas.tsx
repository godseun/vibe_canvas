'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { initializeSocket } from '@/utils/socket'
import { Socket } from 'socket.io-client'

type Point = {
  x: number
  y: number
}

type DrawingData = {
  points: Point[]
  color: string
  width: number
}

export function Canvas({ projectId }: { projectId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [color, setColor] = useState('#000000')
  const [width, setWidth] = useState(2)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const socket = initializeSocket();
    setSocket(socket);

    socket.emit('join_canvas', { projectId });

    socket.on('draw', (drawingData: DrawingData) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      // 다른 사용자의 드로잉 데이터로 그리기
      context.beginPath();
      context.strokeStyle = drawingData.color;
      context.lineWidth = drawingData.width;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      const points = drawingData.points;
      if (points.length > 0) {
        context.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          context.lineTo(points[i].x, points[i].y);
        }
        context.stroke();
      }
    });

    socket.on('participant_count', ({ count }) => {
      setParticipantCount(count);
    });

    return () => {
      socket.emit('leave_canvas', { projectId });
      socket.disconnect();
    };
  }, [projectId]);

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    // 캔버스 크기 설정
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setCurrentPath([{ x, y }])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 현재 경로에 점 추가
    setCurrentPath((prev) => [...prev, { x, y }])

    // 캔버스에 그리기
    context.beginPath()
    context.strokeStyle = color
    context.lineWidth = width
    context.lineCap = 'round'
    context.lineJoin = 'round'

    if (currentPath.length > 0) {
      const lastPoint = currentPath[currentPath.length - 1]
      context.moveTo(lastPoint.x, lastPoint.y)
      context.lineTo(x, y)
      context.stroke()
    }
  }

  const stopDrawing = () => {
    if (!isDrawing || !socket) return

    setIsDrawing(false)

    // 서버로 그리기 데이터 전송
    const drawingData: DrawingData = {
      points: currentPath,
      color,
      width
    }

    socket.emit('draw', { projectId, drawingData })
  }

  return (
    <div className="relative w-full h-[600px] border rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 space-x-2 z-10">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8"
        />
        <input
          type="range"
          min="1"
          max="10"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-32"
        />
        <span className="ml-4 bg-white/80 px-2 py-1 rounded text-sm">
          현재 {participantCount}명 참여 중
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  )
} 