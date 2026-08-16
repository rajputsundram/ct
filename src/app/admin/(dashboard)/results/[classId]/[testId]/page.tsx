import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import AllowReattemptButton from '@/components/admin/AllowReattemptButton'

async function allowReattempt(formData: FormData) {
'use server'

const studentId = Number(formData.get('studentId'))
const testId = Number(formData.get('testId'))
const classId = Number(formData.get('classId'))

const { error } = await supabaseServer
.from('test_attempts')
.delete()
.eq('student_id', studentId)
.eq('test_id', testId)

if (error) {
throw new Error(error.message)
}

redirect(`/admin/results/${classId}/${testId}`)
}

export default async function ClassTestResultsPage({
params,
}: {
params: Promise<{
classId: string
testId: string
}>
}) {
const { classId, testId } = await params

// Get class information
const { data: classData } = await supabaseServer
.from('classes')
.select('id, class_name')
.eq('id', Number(classId))
.single()

// Get test information
const { data: test } = await supabaseServer
.from('tests')
.select('id, test_title, chapter, total_marks, test_date')
.eq('id', Number(testId))
.single()

// Get all students in this class
const { data: students } = await supabaseServer
.from('students')
.select('id, admission_number, name')
.eq('class_id', Number(classId))
.order('admission_number')

// Get attempts for this test
const { data: attempts } = await supabaseServer
.from('test_attempts')
.select('student_id, score, total_marks, submitted_at')
.eq('test_id', Number(testId))

// Create a lookup map
const attemptMap = new Map(
attempts?.map((a) => [a.student_id, a]) || []
)

return (
<main className="min-h-screen bg-gray-100 p-8">
<div className="flex justify-between items-center mb-8">
<div>
<h1 className="text-3xl font-bold">
Class-wise Result
</h1>

      <p className="text-gray-600 mt-1">
        {classData?.class_name} • {test?.test_title}
      </p>

      <p className="text-gray-600">
        {test?.chapter} • {test?.test_date}
      </p>
    </div>

    <Link
      href="/admin/results"
      className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
    >
      Back
    </Link>
  </div>

  <div className="bg-white rounded-xl shadow overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-200">
        <tr>
          <th className="text-left p-4">Admission No</th>
          <th className="text-left p-4">Student Name</th>
          <th className="text-left p-4">Score</th>
          <th className="text-left p-4">Total Marks</th>
          <th className="text-left p-4">Percentage</th>
          <th className="text-left p-4">Status</th>
          <th className="text-left p-4">Submission Date</th>
          <th className="text-left p-4">Action</th>
        </tr>
      </thead>

      <tbody>
        {students && students.length > 0 ? (
          students.map((student) => {
            const attempt = attemptMap.get(student.id)

            const percentage =
              attempt && attempt.total_marks > 0
                ? (
                    (attempt.score / attempt.total_marks) *
                    100
                  ).toFixed(1)
                : '-'

            return (
              <tr key={student.id} className="border-t">
                <td className="p-4">
                  {student.admission_number}
                </td>

                <td className="p-4">
                  {student.name}
                </td>

                <td className="p-4 font-semibold text-blue-600">
                  {attempt ? attempt.score : '-'}
                </td>

                <td className="p-4">
                  {attempt
                    ? attempt.total_marks
                    : test?.total_marks}
                </td>

                <td className="p-4">
                  {attempt ? `${percentage}%` : '-'}
                </td>

                <td className="p-4">
                  {attempt ? (
                    <span className="text-green-600 font-medium">
                      Submitted
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Absent
                    </span>
                  )}
                </td>

                <td className="p-4 text-sm text-gray-600">
                  {attempt?.submitted_at
                    ? new Date(
                        attempt.submitted_at
                      ).toLocaleString()
                    : '-'}
                </td>

                <td className="p-4">
                  {attempt ? (
                    <form action={allowReattempt}>
                      <input
                        type="hidden"
                        name="studentId"
                        value={student.id}
                      />

                      <input
                        type="hidden"
                        name="testId"
                        value={testId}
                      />

                      <input
                        type="hidden"
                        name="classId"
                        value={classId}
                      />

                      <AllowReattemptButton
                        studentName={student.name}
                      />
                    </form>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            )
          })
        ) : (
          <tr>
            <td
              colSpan={8}
              className="p-8 text-center text-gray-500"
            >
              No students found in this class.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</main>

)
}