import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProjectList } from '@/components/ProjectList'

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">내 프로젝트</h1>
        <Link href="/projects/new">
          <Button>새 프로젝트 생성</Button>
        </Link>
      </div>
      <ProjectList />
    </div>
  )
} 