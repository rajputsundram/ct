import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function TestResultsPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

// Get test details
const { data: test } = await supabaseServer
.from('tests')
.select( `id, test_title, chapter, total_marks` )
.eq('id', Number(id))
.single()

// Get all submissions for this test
const { data: attempts } = await supabaseServer
.from('test_attempts')
.select( `id, score, total_marks, submitted_at, students ( admission_number, name, classes ( class_name ) ) `)
.eq('test_id', Number(id))
.order('score', { ascending: false })

return (
<main className="min-h-screen bg-gray-100 p-8">
<div className="flex justify-between items-center mb-8">
<div>
<h1 className="text-3xl font-bold">
Test Results
</h1>
<p className="text-gray-600 mt-1">
{test?.test_title} • {test?.chapter}
</p>
</div>

    <Link
      href="/admin/tests"
      className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
    >
      Back to Tests
    </Link>
  </div>

  <div className="bg-white rounded-xl shadow overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-200">
        <tr>
          <th className="text-left p-4">Admission No</th>
          <th className="text-left p-4">Student Name</th>
          <th className="text-left p-4">Class</th>
          <th className="text-left p-4">Score</th>
          <th className="text-left p-4">Total Marks</th>
          <th className="text-left p-4">Percentage</th>
          <th className="text-left p-4">Submitted At</th>
        </tr>
      </thead>

      <tbody>
        {attempts && attempts.length > 0 ? (
          attempts.map((attempt) => {
            const student = Array.isArray(attempt.students)
              ? attempt.students[0]
              : attempt.students

            const classInfo = Array.isArray(student?.classes)
              ? student.classes[0]
              : student?.classes

            const percentage =
              attempt.total_marks > 0
                ? ((attempt.score / attempt.total_marks) * 100).toFixed(1)
                : '0.0'

            return (
              <tr key={attempt.id} className="border-t">
                <td className="p-4">
                  {student?.admission_number}
                </td>

                <td className="p-4">
                  {student?.name}
                </td>

                <td className="p-4">
                  {classInfo?.class_name}
                </td>

                <td className="p-4 font-semibold text-blue-600">
                  {attempt.score}
                </td>

                <td className="p-4">
                  {attempt.total_marks}
                </td>

                <td className="p-4">
                  {percentage}%
                </td>

                <td className="p-4 text-sm text-gray-600">
                  {attempt.submitted_at
                    ? new Date(attempt.submitted_at).toLocaleString()
                    : '-'}
                </td>
              </tr>
            )
          })
        ) : (
          <tr>
            <td
              colSpan={7}
              className="p-8 text-center text-gray-500"
            >
              No students have submitted this test yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</main>

)
}