import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

async function updateTest(formData: FormData) {
'use server'

const testId = Number(formData.get('testId'))

const test_title = formData.get('test_title') as string
const chapter = formData.get('chapter') as string
const class_id = Number(formData.get('class_id'))
const test_date = formData.get('test_date') as string
const duration_minutes = Number(
formData.get('duration_minutes')
)
const total_marks = Number(formData.get('total_marks'))
const status = formData.get('status') as string

const { error } = await supabase
.from('tests')
.update({
test_title,
chapter,
class_id,
test_date,
duration_minutes,
total_marks,
status,
})
.eq('id', testId)

if (error) {
throw new Error(error.message)
}

redirect('/admin/tests')
}

export default async function EditTestPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

const { data: test } = await supabase
.from('tests')
.select('*')
.eq('id', Number(id))
.single()

const { data: classes } = await supabase
.from('classes')
.select('id, class_name')
.order('class_name')

if (!test) {
redirect('/admin/tests')
}

return (
<main className="min-h-screen bg-gray-100 p-8">
<h1 className="text-3xl font-bold mb-8">
Edit Test
</h1>

  <form
    action={updateTest}
    className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-6"
  >
    <input
      type="hidden"
      name="testId"
      value={test.id}
    />

    <div>
      <label className="block mb-2 font-medium">
        Test Title
      </label>
      <input
        name="test_title"
        defaultValue={test.test_title}
        className="w-full border rounded-lg p-3"
        required
      />
    </div>

    <div>
      <label className="block mb-2 font-medium">
        Chapter
      </label>
      <input
        name="chapter"
        defaultValue={test.chapter}
        className="w-full border rounded-lg p-3"
        required
      />
    </div>

    <div>
      <label className="block mb-2 font-medium">
        Class
      </label>
      <select
        name="class_id"
        defaultValue={String(test.class_id)}
        className="w-full border rounded-lg p-3"
      >
        {classes?.map((cls) => (
          <option
            key={cls.id}
            value={cls.id}
          >
            {cls.class_name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block mb-2 font-medium">
        Test Date
      </label>
      <input
        type="date"
        name="test_date"
        defaultValue={test.test_date}
        className="w-full border rounded-lg p-3"
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 font-medium">
          Duration (minutes)
        </label>
        <input
          type="number"
          name="duration_minutes"
          defaultValue={test.duration_minutes}
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Total Marks
        </label>
        <input
          type="number"
          name="total_marks"
          defaultValue={test.total_marks}
          className="w-full border rounded-lg p-3"
          required
        />
      </div>
    </div>

    <div>
      <label className="block mb-2 font-medium">
        Status
      </label>
      <select
        name="status"
        defaultValue={test.status}
        className="w-full border rounded-lg p-3"
      >
        <option value="scheduled">
          Scheduled
        </option>
        <option value="active">
          Active
        </option>
      </select>
    </div>

    <div className="flex gap-4">
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Save Changes
      </button>

      <a
        href="/admin/tests"
        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
      >
        Cancel
      </a>
    </div>
  </form>
</main>

)
}