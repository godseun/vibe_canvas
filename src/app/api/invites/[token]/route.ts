import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    
    // 데이터베이스에서 초대 정보 조회
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    })

    if (!invitation) {
      return new NextResponse('유효하지 않은 초대입니다.', { status: 404 })
    }

    if (invitation.expiresAt < new Date()) {
      // 만료된 초대는 데이터베이스에서 삭제하지 않고, 클라이언트에 만료됨을 알림
      return new NextResponse('만료된 초대입니다.', { status: 410 })
    }

    if (invitation.accepted) {
      return new NextResponse('이미 수락된 초대입니다.', { status: 409 })
    }

    return NextResponse.json({
      projectId: invitation.projectId,
      projectName: invitation.project.name,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt.toISOString()
    })
  } catch (error) {
    console.error('초대 정보 조회 중 오류 발생:', error)
    return new NextResponse('초대 정보를 조회하는 중 오류가 발생했습니다.', { status: 500 })
  }
} 