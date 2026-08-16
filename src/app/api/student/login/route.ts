import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
const { admissionNumber, password } = await request.json()

const { data: student, error } = await supabaseServer
.from('students')
.select('*')
.eq('admission_number', admissionNumber)
.single()

if (error || !student) {
return NextResponse.json(
{ message: 'Student not found' },
{ status: 404 }
)
}

if (student.password !== password) {
return NextResponse.json(
{ message: 'Invalid password' },
{ status: 401 }
)
}

const response = NextResponse.json({ success: true })

response.cookies.set('student_session', String(student.id), {
httpOnly: true,
path: '/',
maxAge: 60 * 60 * 3, // 3 hours
})

return response
}
