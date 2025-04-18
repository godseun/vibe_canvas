'use client'

import { useSession } from "next-auth/react"
import { LogoutButton } from '@/components/LogoutButton'

export function Navbar() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="border-b p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-semibold">MCP</div>
        <LogoutButton />
      </div>
    </nav>
  )
} 