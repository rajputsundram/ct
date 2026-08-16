import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function addStudent(formData: FormData) {
'use server'

const admissionNumber = formData.get('admissionNumber') as string
const name = formData.get('name') as string
const classId = Number(formData.get('classId'))

// Check duplicate admission number
const { data: existingStudent } = await supabaseServer
.from('students')
.select('id')
.eq('admission_number', admissionNumber)
.maybeSingle()

if (existingStudent) {
redirect(
`/admin/students/new?class=${classId}&error=Admission number already exists`
)
}

const { error } = await supabaseServer.from('students').insert({
admission_number: admissionNumber,
name,
class_id: classId,
password: '12345',
})

if (error) {
redirect(
`/admin/students/new?class=${classId}&error=Unable to add student`
)
}

// Stay on the same page after saving
redirect(
`/admin/students/new?class=${classId}&success=Student added successfully`
)
}

export default async function NewStudentPage({
searchParams,
}: {
searchParams: Promise<{
class?: string
error?: string
success?: string
}>
}) {
const params = await searchParams

const { data: classes } = await supabaseServer
.from('classes')
.select('*')
.order('class_name')

const selectedClass = params.class || ''

return (
<main className="min-h-screen bg-gray-100 p-8">
<div className="flex justify-between items-center mb-8">
<h1 className="text-3xl font-bold">Add Student</h1>

    <Link
      href={`/admin/students?class=${selectedClass}`}
      className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
    >
      Back to Student List
    </Link>
  </div>

  <form
    action={addStudent}
    className="bg-white p-6 rounded-xl shadow max-w-2xl space-y-6"
  >
    {params.error && (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
        {params.error}
      </div>
    )}

    {params.success && (
      <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
        {params.success}
      </div>
    )}

    <div>
      <label className="block mb-2 font-medium">Admission Number</label>
      <input
        name="admissionNumber"
        type="text"
        className="w-full border rounded-lg p-3"
        placeholder="1001"
        required
        autoFocus
      />
    </div>

    <div>
      <label className="block mb-2 font-medium">Student Name</label>
      <input
        name="name"
        type="text"
        className="w-full border rounded-lg p-3"
        placeholder="Rahul Kumar"
        required
      />
    </div>

    <div>
      <label className="block mb-2 font-medium">Class</label>
      <select
        name="classId"
        defaultValue={selectedClass}
        className="w-full border rounded-lg p-3"
        required
      >
        <option value="" disabled>
          Select Class
        </option>

        {classes?.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.class_name}
          </option>
        ))}
      </select>
    </div>

    <div className="bg-gray-100 p-4 rounded-lg">
      <p className="font-medium">Default Password</p>
      <p className="text-gray-700">12345</p>
    </div>

    <div className="flex gap-4">
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Save & Add Another
      </button>

      <Link
        href={`/admin/students?class=${selectedClass}`}
        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
      >
        Done
      </Link>
    </div>
  </form>
</main>

)
}