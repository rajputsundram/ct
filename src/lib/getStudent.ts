import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'

export async function getStudent() {
const cookieStore = await cookies()
const session = cookieStore.get('student_session')

if (!session) {
redirect('/student/login')
}

const studentId = Number(session.value)

const { data: student } = await supabaseServer
.from('students')
.select(`id, name, admission_number, class_id, classes ( class_name ) `)
.eq('id', studentId)
.single()

if (!student) {
redirect('/student/login')
}

return student
}