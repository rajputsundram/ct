import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import DeleteStudentButton from '@/components/DeleteStudentButton'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>
}) {
  const params = await searchParams

  const { data: classes } = await supabaseServer
    .from('classes')
    .select('*')
    .order('class_name')

  const selectedClass =
    params.class || classes?.[0]?.id?.toString() || ''

  const { data: students } = await supabaseServer
    .from('students')
    .select(`
      id,
      admission_number,
      name,
      classes ( class_name )
    `)
    .eq('class_id', Number(selectedClass))
    .order('admission_number')

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
        <label className="block mb-2 font-medium">
          Select Class
        </label>

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
                <tr
                  key={student.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {student.admission_number}
                  </td>

                  <td className="p-4">
                    {student.name}
                  </td>

                  <td className="p-4">
                   
                    {`student.classes?.class_name ?? 'N/A'`}
                    
                  </td>

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
                <td
                  colSpan={4}
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