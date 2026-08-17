import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const { admissionNumber, password } = await request.json()

    if (!admissionNumber || !password) {
      return NextResponse.json(
        {
          message: 'Admission number and password are required',
        },
        { status: 400 }
      )
    }

    const { data: student, error } = await supabaseServer
      .from('students')
      .select(
        'id, admission_number, name, password, class_id'
      )
      .eq('admission_number', admissionNumber)
      .single()

    if (error || !student) {
      console.error('Student lookup error:', error)

      return NextResponse.json(
        {
          message: 'Student not found',
        },
        { status: 404 }
      )
    }

    if (student.password !== password) {
      return NextResponse.json(
        {
          message: 'Invalid password',
        },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      studentId: student.id,
      name: student.name,
    })

    // This automatically replaces the old student_session cookie
    response.cookies.set({
      name: 'student_session',
      value: String(student.id),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 3,
    })

    console.log('STUDENT LOGIN SUCCESS')
    console.log('Student ID:', student.id)
    console.log('Cookie set/replaced: student_session')

    return response
  } catch (error) {
    console.error('Student login error:', error)

    return NextResponse.json(
      {
        message: 'Something went wrong during login',
      },
      { status: 500 }
    )
  }
}