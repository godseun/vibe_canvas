'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Canvas } from '@/components/Canvas'

type Member = {
  role: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

type Project = {
  id: string
  name: string
  description: string | null
  createdAt: string
  owner: {
    id: string
    name: string | null
    email: string
  }
  members: Member[]
}

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`)
        if (!response.ok) {
          throw new Error('프로젝트를 불러오는데 실패했습니다.')
        }
        const data = await response.json()
        setProject(data)
      } catch (error) {
        toast({
          title: '오류가 발생했습니다.',
          description: error instanceof Error ? error.message : '프로젝트를 불러오는데 실패했습니다.',
          variant: 'destructive'
        })
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id, router, toast])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || isInviting) return

    setIsInviting(true)
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: inviteEmail,
          projectId: id
        }),
      })

      if (!response.ok) {
        throw new Error('초대 전송에 실패했습니다.')
      }

      toast({
        title: '초대가 전송되었습니다.',
        description: `${inviteEmail} 주소로 초대 메일이 전송되었습니다.`,
      })
      setInviteEmail('')
    } catch (error) {
      toast({
        title: '오류가 발생했습니다.',
        description: error instanceof Error ? error.message : '초대 전송에 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setIsInviting(false)
    }
  }

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (!project) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            목록으로
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/edit`}>수정</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>캔버스</CardTitle>
              <CardDescription>
                실시간으로 팀원들과 함께 작업할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Canvas projectId={id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 정보</CardTitle>
              <CardDescription>
                {project.description || '설명이 없습니다.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>소유자: {project.owner.name || project.owner.email}</p>
                <p>생성일: {new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>프로젝트 멤버</CardTitle>
              <CardDescription>
                프로젝트에 참여하고 있는 멤버 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.members.map((member) => (
                  <li key={member.user.id} className="flex justify-between items-center">
                    <span>{member.user.name || member.user.email}</span>
                    <span className="text-sm text-muted-foreground">{member.role}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleInvite} className="w-full flex gap-2">
                <Input
                  type="email"
                  placeholder="초대할 이메일 주소"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isInviting}
                />
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? '초대 중...' : '초대'}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 