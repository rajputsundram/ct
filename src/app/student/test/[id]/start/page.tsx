import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import TestRunner from './TestRunner'

export default async function StartTestPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

const cookieStore = await cookies()
const session = cookieStore.get('student_session')

// Student must be logged in
if (!session) {
redirect('/student/login')
}

const studentId = Number(session.value)

// Get student
const { data: student } = await supabaseServer
.from('students')
.select( `id, class_id` )
.eq('id', studentId)
.single()

if (!student) {
redirect('/student/login')
}

// Check if student has already submitted this test
const { data: existingAttempt } = await supabaseServer
.from('test_attempts')
.select('id')
.eq('student_id', student.id)
.eq('test_id', Number(id))
.maybeSingle()

if (existingAttempt) {
return (
<main className="min-h-screen flex items-center justify-center bg-gray-100">
<div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
<h1 className="text-2xl font-bold mb-4">
Test Already Submitted
</h1>

      <p className="text-gray-600 mb-6">
        You have already submitted this test. Please contact your teacher if
        you need another attempt.
      </p>

      <Link
        href="/student/logout"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Logout
      </Link>
    </div>
  </main>
)

}

// Get test
const { data: test } = await supabaseServer
.from('tests')
.select( `id, test_title, duration_minutes, class_id, status` )
.eq('id', Number(id))
.eq('class_id', student.class_id)
.eq('status', 'active')
.single()

if (!test) {
redirect('/student')
}

// Get questions
const { data: questions } = await supabaseServer
.from('questions')
.select( `id, question, question_type, options, marks, question_order` )
.eq('test_id', test.id)
.order('question_order', { ascending: true })

const formattedQuestions =
questions?.map((q) => ({
id: q.id,
question: q.question,
question_type: q.question_type as 'MCQ' | 'FILL' | 'QA',
options:
typeof q.options === 'string'
? JSON.parse(q.options)
: q.options,
marks: q.marks,
})) || []

return (
<TestRunner testId={test.id} durationMinutes={test.duration_minutes} questions={formattedQuestions} />
)
}