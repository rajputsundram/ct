import { NextResponse } from 'next/server'

export async function GET(request: Request) {
const response = NextResponse.redirect(new URL('/', request.url))

response.cookies.set('student_session', '', {
expires: new Date(0),
path: '/',
})

return response
}
