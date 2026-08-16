import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function TestInstructionsPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

const cookieStore = await cookies()
const session = cookieStore.get('student_session')

// If student is not logged in
if (!session) {
redirect('/student/login')
}

const studentId = Number(session.value)

// Get student information
const { data: student } = await supabaseServer
  .from('students')
  .select(`
    id,
    class_id
  `)
  .eq('id', studentId)
  .single()

if (!student) {
redirect('/student/login')
}

// Get the test for this student's class
const { data: test } = await supabaseServer
  .from('tests')
  .select(`
    id,
    test_title,
    chapter,
    duration_minutes,
    total_marks,
    test_date,
    class_id,
    status
  `)
  .eq('id', Number(id))
  .eq('class_id', student.class_id)
  .eq('status', 'active')
  .single()

if (!test) {
return (
<main className="min-h-screen flex items-center justify-center bg-gray-100">
<div className="bg-white p-8 rounded-xl shadow text-center">
<h1 className="text-2xl font-bold mb-4">
Test not available
</h1>

      <Link
        href="/student"
        className="text-blue-600 hover:underline"
      >
        Back to Dashboard
      </Link>
    </div>
  </main>
)

}

return (
<main className="min-h-screen bg-gray-100 p-8">
<div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
<h1 className="text-3xl font-bold mb-6">
{test.test_title}
</h1>

    <div className="space-y-3 mb-8">
      <p>
        <strong>Chapter:</strong> {test.chapter}
      </p>

      <p>
        <strong>Duration:</strong> {test.duration_minutes} minutes
      </p>

      <p>
        <strong>Total Marks:</strong> {test.total_marks}
      </p>

      <p>
        <strong>Date:</strong> {test.test_date}
      </p>
    </div>

    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-8">
      <h2 className="text-xl font-semibold mb-3">
        Instructions
      </h2>

      <ul className="list-disc pl-5 space-y-2">
        <li>Read all questions carefully before answering.</li>
        <li>The timer will start when you click "Start Test".</li>
        <li>Do not refresh the page during the test.</li>
        <li>Each question carries equal marks unless specified.</li>
        <li>Click Submit before the timer ends.</li>
      </ul>
    </div>

    <div className="flex justify-between">
      <Link
        href="/student"
        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
      >
        Back
      </Link>

      <Link
        href={`/student/test/${test.id}/start`}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Start Test
      </Link>
    </div>
  </div>
</main>

)
}