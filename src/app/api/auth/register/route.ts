import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "이름은 2글자 이상이어야 합니다."),
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = registerSchema.parse(json)

    const exists = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (exists) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(body.password, 10)

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    })

    const { password: _, ...result } = user

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 