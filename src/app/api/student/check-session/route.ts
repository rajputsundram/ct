import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('student_session')

  return NextResponse.json({
    cookieExists: !!session,
    cookieValue: session?.value ?? null,
  })
}