import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({
    message: 'Student session test cookie created',
  })

  response.cookies.set('student_session', '123', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 3,
  })

  return response
}