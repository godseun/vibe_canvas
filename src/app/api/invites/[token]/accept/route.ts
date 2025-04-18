import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    // 사용자 인증 정보 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('인증되지 않은 사용자입니다.', { status: 401 })
    }

    const token = params.token
    
    // 데이터베이스에서 초대 정보 조회
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return new NextResponse('유효하지 않은 초대입니다.', { status: 404 })
    }

    if (invitation.expiresAt < new Date()) {
      // 만료된 초대 정보 업데이트
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { accepted: false }
      })
      return new NextResponse('만료된 초대입니다.', { status: 410 })
    }

    if (invitation.accepted) {
      return new NextResponse('이미 수락된 초대입니다.', { status: 409 })
    }

    // 초대된 이메일과 현재 사용자 이메일 비교
    if (session.user.email !== invitation.email) {
      return new NextResponse('초대된 이메일과 현재 로그인한 계정이 일치하지 않습니다.', { status: 403 })
    }

    // 이미 프로젝트 멤버인지 확인
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: invitation.projectId
        }
      }
    })

    if (existingMembership) {
      // 초대 상태 업데이트
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { 
          accepted: true,
          acceptedAt: new Date()
        }
      })
      
      return NextResponse.json({
        message: '이미 프로젝트의 멤버입니다.',
        projectId: invitation.projectId
      })
    }

    // 프로젝트 존재 여부 확인
    const project = await prisma.project.findUnique({
      where: { id: invitation.projectId }
    })

    if (!project) {
      return new NextResponse('프로젝트가 존재하지 않습니다.', { status: 404 })
    }

    // 트랜잭션으로 멤버십 생성 및 초대 수락 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 멤버십 생성
      const membership = await tx.membership.create({
        data: {
          role: invitation.role,
          user: {
            connect: { id: session.user.id }
          },
          project: {
            connect: { id: invitation.projectId }
          }
        }
      })
      
      // 초대 상태 업데이트
      const updatedInvitation = await tx.invitation.update({
        where: { id: invitation.id },
        data: { 
          accepted: true,
          acceptedAt: new Date()
        }
      })
      
      return { membership, updatedInvitation }
    })

    // 콘솔에 로그 기록
    console.log(`사용자 ${session.user.email}이(가) 프로젝트 ${invitation.projectId}에 ${invitation.role} 역할로 추가되었습니다.`)

    return NextResponse.json({
      message: '초대가 수락되었습니다.',
      projectId: invitation.projectId
    })
  } catch (error) {
    console.error('초대 수락 중 오류 발생:', error)
    return new NextResponse('초대 수락 중 오류가 발생했습니다.', { status: 500 })
  }
} 