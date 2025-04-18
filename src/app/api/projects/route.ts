import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('프로젝트 목록 조회 중 오류 발생:', error)
    return NextResponse.json(
      { error: '프로젝트 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: '프로젝트 이름은 필수입니다.' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        owner: {
          connect: {
            id: session.user.id
          }
        },
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER'
          }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('프로젝트 생성 중 오류 발생:', error)
    return NextResponse.json(
      { error: '프로젝트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 