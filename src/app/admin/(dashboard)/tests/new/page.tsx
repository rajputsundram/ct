import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function createTest(formData: FormData) {
  'use server'

  const classId = Number(formData.get('classId'))
  const testTitle = formData.get('testTitle') as string
  const chapter = formData.get('chapter') as string
  const testDate = formData.get('testDate') as string
  const duration = Number(formData.get('duration'))
  const totalMarks = Number(formData.get('totalMarks'))
  const status = formData.get('status') as string

  const { error } = await supabaseServer.from('tests').insert({
    class_id: classId,
    test_title: testTitle,
    chapter,
    test_date: testDate,
    duration_minutes: duration,
    total_marks: totalMarks,
    status,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/admin/tests')
}

export default async function NewTestPage() {
  const { data: classes } = await supabaseServer
    .from('classes')
    .select('*')
    .order('class_name')

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Create New Test</h1>

      <form
        action={createTest}
        className="bg-white p-6 rounded-xl shadow max-w-2xl space-y-6"
      >
        <div>
          <label className="block mb-2 font-medium">Class</label>
          <select
            name="classId"
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

        <div>
          <label className="block mb-2 font-medium">Test Title</label>
          <input
            name="testTitle"
            type="text"
            className="w-full border rounded-lg p-3"
            placeholder="Chapter 3 Test"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Chapter</label>
          <input
            name="chapter"
            type="text"
            className="w-full border rounded-lg p-3"
            placeholder="Digital Documentation"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Test Date</label>
          <input
            name="testDate"
            type="date"
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
              name="duration"
              type="number"
              className="w-full border rounded-lg p-3"
              placeholder="30"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Total Marks</label>
            <input
              name="totalMarks"
              type="number"
              className="w-full border rounded-lg p-3"
              placeholder="25"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Status</label>
          <select
            name="status"
            className="w-full border rounded-lg p-3"
          >
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Create Test
        </button>
      </form>
    </main>
  )
}