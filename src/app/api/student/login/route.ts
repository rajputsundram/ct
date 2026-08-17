import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const { admissionNumber, password } = await request.json()

    if (!admissionNumber || !password) {
      return NextResponse.json(
        { message: 'Admission number and password are required' },
        { status: 400 }
      )
    }

    const { data: student, error } = await supabaseServer
      .from('students')
      .select('id, admission_number, name, password, class_id')
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

    const response = NextResponse.json({
      success: true,
      studentId: student.id,
    })

    response.cookies.set('student_session', String(student.id), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 3,
    })

    // Temporary diagnostic header
    response.headers.set(
      'X-Student-Login-Cookie',
      'created'
    )

    return response
  } catch (error) {
    console.error('Student login error:', error)

    return NextResponse.json(
      { message: 'Something went wrong during login' },
      { status: 500 }
    )
  }
}