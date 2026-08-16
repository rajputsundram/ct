import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function updateStudent(formData: FormData) {
'use server'

const id = Number(formData.get('id'))
const admissionNumber = formData.get('admissionNumber') as string
const name = formData.get('name') as string
const classId = Number(formData.get('classId'))

const { error } = await supabaseServer
.from('students')
.update({
admission_number: admissionNumber,
name,
class_id: classId,
})
.eq('id', id)

if (error) {
throw new Error(error.message)
}

redirect(`/admin/students?class=${classId}`)
}

export default async function EditStudentPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

const { data: student } = await supabaseServer
.from('students')
.select('*')
.eq('id', id)
.single()

const { data: classes } = await supabaseServer
.from('classes')
.select('*')
.order('class_name')

if (!student) {
return <div>Student not found</div>
}

return (
<main className="min-h-screen bg-gray-100 p-8">
<h1 className="text-3xl font-bold mb-8">Edit Student</h1>

  <form
    action={updateStudent}
    className="bg-white p-6 rounded-xl shadow max-w-2xl space-y-6"
  >
    <input type="hidden" name="id" value={student.id} />

    <div>
      <label className="block mb-2 font-medium">Admission Number</label>
      <input
        name="admissionNumber"
        type="text"
        defaultValue={student.admission_number}
        className="w-full border rounded-lg p-3"
        required
      />
    </div>

    <div>
      <label className="block mb-2 font-medium">Student Name</label>
      <input
        name="name"
        type="text"
        defaultValue={student.name}
        className="w-full border rounded-lg p-3"
        required
      />
    </div>

    <div>
      <label className="block mb-2 font-medium">Class</label>
      <select
        name="classId"
        defaultValue={student.class_id}
        className="w-full border rounded-lg p-3"
        required
      >
        {classes?.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.class_name}
          </option>
        ))}
      </select>
    </div>

    <button
      type="submit"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Update Student
    </button>
  </form>
</main>

)
}