import { ProjectForm } from '@/components/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">새 프로젝트 생성</h1>
      <ProjectForm />
    </div>
  )
} 