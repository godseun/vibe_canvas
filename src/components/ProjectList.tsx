'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type Project = {
  id: string
  name: string
  description: string | null
  createdAt: string
  owner: {
    name: string | null
    email: string
  }
  members: {
    role: string
    user: {
      name: string | null
      email: string
    }
  }[]
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('프로젝트 목록을 불러오는데 실패했습니다.')
        }
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        toast({
          title: '오류가 발생했습니다.',
          description: error instanceof Error ? error.message : '프로젝트 목록을 불러오는데 실패했습니다.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [toast])

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl font-semibold mb-2">프로젝트가 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            새로운 프로젝트를 생성하여 시작해보세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                {project.description || '설명이 없습니다.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>소유자: {project.owner.name || project.owner.email}</p>
                <p>생성일: {new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 