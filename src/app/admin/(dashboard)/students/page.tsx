import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import DeleteStudentButton from '@/components/DeleteStudentButton'

interface ClassRow {
  id: number
  class_name: string
}

interface StudentRow {
  id: number
  admission_number: string
  name: string
  // Supabase types a to-one FK join as an array by default when there
  // are no generated types in play, so we accept either shape.
  classes: { class_name: string } | { class_name: string }[] | null
}

function getClassName(classes: StudentRow['classes']): string {
  if (!classes) return 'N/A'
  if (Array.isArray(classes)) return classes[0]?.class_name ?? 'N/A'
  return classes.class_name ?? 'N/A'
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>
}) {
  const params = await searchParams

  const { data: classes, error: classesError } = await supabaseServer
    .from('classes')
    .select('*')
    .order('class_name')
    .returns<ClassRow[]>()

  if (classesError) {
    console.error('Failed to load classes:', classesError.message)
  }

  const selectedClass =
    params.class || classes?.[0]?.id?.toString() || ''

  const selectedClassId = Number(selectedClass)
  const hasValidClass = selectedClass !== '' && !Number.isNaN(selectedClassId)

  const { data: students, error: studentsError } = hasValidClass
    ? await supabaseServer
        .from('students')
        .select(
          `
          id,
          admission_number,
          name,
          classes ( class_name )
        `
        )
        .eq('class_id', selectedClassId)
        .order('admission_number')
        .returns<StudentRow[]>()
    : { data: [] as StudentRow[], error: null }

  if (studentsError) {
    console.error('Failed to load students:', studentsError.message)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Students</h1>

        <Link
          href={`/admin/students/new?class=${selectedClass}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Student
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <label className="block mb-2 font-medium">Select Class</label>

        <div className="flex flex-wrap gap-2">
          {classes?.map((cls) => (
            <Link
              key={cls.id}
              href={`/admin/students?class=${cls.id}`}
              className={`px-4 py-2 rounded-lg border ${
                selectedClass === cls.id.toString()
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {cls.class_name}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-left p-4">Admission No</th>
              <th className="text-left p-4">Student Name</th>
              <th className="text-left p-4">Class</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {students && students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-4">{student.admission_number}</td>

                  <td className="p-4">{student.name}</td>

                  <td className="p-4">{getClassName(student.classes)}</td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/students/${student.id}/edit`}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </Link>

                      <DeleteStudentButton
                        studentId={student.id}
                        studentName={student.name}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
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