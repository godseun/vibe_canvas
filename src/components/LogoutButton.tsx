'use client'

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
    >
      로그아웃
    </Button>
  )
} 