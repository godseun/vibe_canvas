import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <form
          action={async () => {
            "use server"
            await signOut({ redirect: true, callbackUrl: "/login" })
          }}
        >
          <Button variant="outline">로그아웃</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">내 프로젝트</h2>
          <p className="text-muted-foreground mb-4">
            프로젝트를 생성하고 관리할 수 있습니다.
          </p>
          <Link href="/projects">
            <Button>프로젝트 관리</Button>
          </Link>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
          <p className="text-muted-foreground">
            최근 활동 내역이 없습니다.
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">도움말</h2>
          <p className="text-muted-foreground mb-4">
            서비스 이용에 도움이 필요하시나요?
          </p>
          <Link href="/help">
            <Button variant="outline">도움말 보기</Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 