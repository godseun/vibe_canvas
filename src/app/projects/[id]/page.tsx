import { ProjectDetail } from '@/components/ProjectDetail'

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <ProjectDetail id={params.id} />
    </div>
  )
} 