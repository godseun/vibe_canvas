'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export function ProjectForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '프로젝트 생성에 실패했습니다.')
      }

      toast({
        title: '프로젝트가 생성되었습니다.',
        description: '프로젝트 목록 페이지로 이동합니다.'
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        title: '오류가 발생했습니다.',
        description: error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          프로젝트 이름
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="프로젝트 이름을 입력하세요"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          프로젝트 설명
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="프로젝트에 대한 설명을 입력하세요"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '생성 중...' : '프로젝트 생성'}
      </Button>
    </form>
  )
} 