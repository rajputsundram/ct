import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({
    message: 'Test cookie created',
  })

  response.cookies.set('test_cookie', 'hello', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 3600,
  })

  return response
}