import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 인증이 필요하지 않은 공개 경로들
const publicPaths = ["/login", "/register", "/auth"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 공개 경로는 인증 체크를 하지 않음
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next()
  }

  // 정적 파일 요청은 인증 체크를 하지 않음
  if (
    path.startsWith("/_next") || // Next.js 시스템 파일
    path.startsWith("/api/auth") || // 인증 API 경로
    path.includes(".") // 이미지, 파비콘 등
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// 미들웨어가 실행될 경로 패턴 설정
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 