import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import { getStudent } from '@/lib/getStudent'

export default async function StudentDashboardPage() {
const student = await getStudent()

const classInfo = Array.isArray(student.classes)
? student.classes[0]
: student.classes

// Get active tests for the student's class
const { data: tests } = await supabaseServer
.from('tests')
.select( `id, test_title, chapter, duration_minutes, total_marks, test_date, status` )
.eq('class_id', student.class_id)
.eq('status', 'active')
.order('test_date', { ascending: true })

// Get tests already submitted by the student
const { data: attempts } = await supabaseServer
.from('test_attempts')
.select('test_id')
.eq('student_id', student.id)

const attemptedTestIds = new Set(
attempts?.map((a) => a.test_id) || []
)

return (
<div>
<div className="bg-white rounded-xl shadow p-6 mb-8">
<div className="flex justify-between items-start">
<div>
<h1 className="text-3xl font-bold">
Welcome, {student.name}
</h1>

        <p className="text-gray-600 mt-2">
          Admission No: {student.admission_number}
        </p>

        <p className="text-gray-600">
          Class: {classInfo?.class_name}
        </p>
      </div>

      <Link
        href="/api/student/logout"
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Logout
      </Link>
    </div>
  </div>

  <h2 className="text-2xl font-semibold mb-4">
    Available Tests
  </h2>

  {tests && tests.length > 0 ? (
    <div className="grid gap-4">
      {tests.map((test) => {
        const alreadySubmitted =
          attemptedTestIds.has(test.id)

        return (
          <div
            key={test.id}
            className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-semibold">
                {test.test_title}
              </h3>

              <p className="text-gray-600">
                {test.chapter}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Date: {test.test_date}
              </p>

              <p className="text-sm text-gray-500">
                Duration: {test.duration_minutes} minutes
              </p>

              <p className="text-sm text-gray-500">
                Total Marks: {test.total_marks}
              </p>
            </div>

         {alreadySubmitted ? (
  <div className="text-center">
    <div className="bg-green-100 text-green-700 px-5 py-3 rounded-lg font-semibold">
      Submitted
    </div>
    <p className="text-xs text-gray-500 mt-2">
      You have already submitted this test.
    </p>
  </div>
) : (
  <Link
    href={`/student/test/${test.id}`}
    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
  >
    Start Test
  </Link>
)}
          </div>
        )
      })}
    </div>
  ) : (
    <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
      No active tests are available for your class.
    </div>
  )}
</div>

)
}