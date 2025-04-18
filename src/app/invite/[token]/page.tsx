'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface Invitation {
  projectId: string
  email: string
  expiresAt: string
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invites/${params.token}`)
        if (!response.ok) {
          throw new Error(await response.text())
        }
        const data = await response.json()
        setInvitation(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : '초대를 확인할 수 없습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitation()
  }, [params.token])

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      const response = await fetch(`/api/invites/${params.token}/accept`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorMessage = await response.text()
        toast({
          title: '초대 수락 실패',
          description: errorMessage,
          variant: 'destructive'
        })
        return
      }

      const data = await response.json()
      toast({
        title: '초대 수락 완료',
        description: data.message,
        variant: 'default'
      })
      
      // 프로젝트 페이지로 리다이렉트
      router.push(`/projects/${data.projectId}`)
    } catch (error) {
      console.error('초대 수락 중 오류:', error)
      toast({
        title: '초대 수락 실패',
        description: '초대를 수락하는 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>초대 정보를 확인하는 중...</p>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-red-500">초대 오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || '유효하지 않은 초대입니다.'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/')}>홈으로</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>프로젝트 초대</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <span className="font-semibold">{invitation.email}</span> 님을 프로젝트에 초대합니다.
          </p>
          <p className="text-sm text-muted-foreground">
            이 초대는 {new Date(invitation.expiresAt).toLocaleDateString()}까지 유효합니다.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => router.push('/')}>
            거절
          </Button>
          <Button onClick={handleAccept} disabled={isAccepting}>
            {isAccepting ? '수락 중...' : '수락'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 