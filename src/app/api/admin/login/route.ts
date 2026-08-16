import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const response = NextResponse.json({ success: true })

    response.cookies.set('admin_session', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8,
    })

    return response
  }

  return NextResponse.json(
    { success: false, message: 'Invalid email or password' },
    { status: 401 }
  )
}