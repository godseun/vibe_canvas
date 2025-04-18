import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    // 사용자 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const { email, projectId, role = 'EDITOR' } = await request.json()

    // 필수 필드 검증
    if (!email || !projectId) {
      return NextResponse.json({ error: '이메일과 프로젝트 ID가 필요합니다.' }, { status: 400 })
    }

    // 프로젝트 존재 및 권한 확인
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                role: 'OWNER'
              }
            }
          }
        ]
      }
    })

    if (!project) {
      return NextResponse.json({ error: '프로젝트가 존재하지 않거나 초대 권한이 없습니다.' }, { status: 403 })
    }

    // 이미 존재하는 멤버인지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { projectId }
        }
      }
    })

    if (existingUser?.memberships && existingUser.memberships.length > 0) {
      return NextResponse.json({ error: '이미 프로젝트에 가입된 사용자입니다.' }, { status: 400 })
    }

    // 이미 보낸 초대가 있는지 확인
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        projectId,
        email,
        accepted: false,
        expiresAt: {
          gt: new Date() // 만료되지 않은 초대만
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ 
        message: '이미 해당 이메일로 초대를 보냈습니다.',
        inviteLink: `/invite/${existingInvitation.token}`
      })
    }

    // 초대 토큰 생성
    const token = randomUUID()
    
    // 만료일 설정 (7일 후)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // 유효한 역할인지 확인
    if (!['OWNER', 'EDITOR', 'VIEWER'].includes(role)) {
      return NextResponse.json({ error: '유효하지 않은 역할입니다.' }, { status: 400 })
    }

    // 데이터베이스에 초대 정보 저장
    const invitation = await prisma.invitation.create({
      data: {
        token,
        email,
        role: role as Role,
        expiresAt,
        project: {
          connect: { id: projectId }
        },
        user: {
          connect: { id: session.user.id }
        }
      }
    })

    // TODO: 이메일 전송 로직 구현
    // 실제 애플리케이션에서는 여기에 이메일 전송 코드를 추가해야 합니다.
    console.log(`초대 링크: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`)

    return NextResponse.json({ 
      message: '초대가 생성되었습니다.',
      inviteLink: `/invite/${token}`,
      invitation
    })
  } catch (error) {
    console.error('초대 처리 중 오류 발생:', error)
    return NextResponse.json({ error: '초대 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
} 