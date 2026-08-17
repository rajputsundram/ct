import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function updateTestStatus(formData: FormData) {
  'use server'

  const testId = Number(formData.get('testId'))
  const status = formData.get('status') as string

  if (!testId || !status) {
    throw new Error('Test ID and status are required')
  }

  const { error } = await supabase
    .from('tests')
    .update({ status })
    .eq('id', testId)

  if (error) {
    throw new Error(`Update test status failed: ${error.message}`)
  }

  redirect('/admin/tests')
}

async function deleteTest(formData: FormData) {
  'use server'

  const testId = Number(formData.get('testId'))

  if (!testId) {
    throw new Error('Test ID is required')
  }

  // Delete related attempts first
  const { error: attemptsError } = await supabase
    .from('test_attempts')
    .delete()
    .eq('test_id', testId)

  if (attemptsError) {
    throw new Error(
      `Delete attempts failed: ${attemptsError.message}`
    )
  }

  // Delete related questions
  const { error: questionsError } = await supabase
    .from('questions')
    .delete()
    .eq('test_id', testId)

  if (questionsError) {
    throw new Error(
      `Delete questions failed: ${questionsError.message}`
    )
  }

  // Delete the test
  const { error: testError } = await supabase
    .from('tests')
    .delete()
    .eq('id', testId)

  if (testError) {
    throw new Error(
      `Delete test failed: ${testError.message}`
    )
  }

  redirect('/admin/tests')
}

export default async function TestsPage() {
  const { data: tests, error } = await supabase
    .from('tests')
    .select(
      `
        id,
        test_title,
        chapter,
        duration_minutes,
        total_marks,
        status,
        test_date,
        classes (
          id,
          class_name
        )
      `
    )
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border border-red-300 text-red-700 p-6 rounded-xl">
          <h1 className="text-xl font-bold mb-2">
            Failed to load tests
          </h1>

          <p>{error.message}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Tests
        </h1>

        <Link
          href="/admin/tests/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Test
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-4">
                  Title
                </th>

                <th className="text-left p-4">
                  Class
                </th>

                <th className="text-left p-4">
                  Chapter
                </th>

                <th className="text-left p-4">
                  Date
                </th>

                <th className="text-left p-4">
                  Duration
                </th>

                <th className="text-left p-4">
                  Marks
                </th>

                <th className="text-left p-4">
                  Status
                </th>

                <th className="text-left p-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {tests?.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-gray-500"
                  >
                    No tests found.
                  </td>
                </tr>
              ) : (
                tests?.map((test) => {
                  const testClass = Array.isArray(test.classes)
                    ? test.classes[0]
                    : test.classes

                  return (
                    <tr
                      key={test.id}
                      className="border-t"
                    >
                      <td className="p-4">
                        {test.test_title}
                      </td>

                      <td className="p-4">
                        {testClass?.class_name ?? 'N/A'}
                      </td>

                      <td className="p-4">
                        {test.chapter}
                      </td>

                      <td className="p-4">
                        {test.test_date}
                      </td>

                      <td className="p-4">
                        {test.duration_minutes} min
                      </td>

                      <td className="p-4">
                        {test.total_marks}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            test.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {test.status === 'active'
                            ? 'Active'
                            : 'Scheduled'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">

                          {/* Questions */}
                          <Link
                            href={`/admin/tests/${test.id}/questions`}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                          >
                            Questions
                          </Link>

                          {/* Results */}
                          <Link
                            href={`/admin/results/${testClass?.id}/${test.id}`}
                            className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700"
                          >
                            Results
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/tests/${test.id}/edit`}
                            className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600"
                          >
                            Edit
                          </Link>

                          {/* Activate / Disable */}
                          <form action={updateTestStatus}>
                            <input
                              type="hidden"
                              name="testId"
                              value={test.id}
                            />

                            {test.status === 'active' ? (
                              <>
                                <input
                                  type="hidden"
                                  name="status"
                                  value="scheduled"
                                />

                                <button
                                  type="submit"
                                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                                >
                                  Disable
                                </button>
                              </>
                            ) : (
                              <>
                                <input
                                  type="hidden"
                                  name="status"
                                  value="active"
                                />

                                <button
                                  type="submit"
                                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                                >
                                  Activate
                                </button>
                              </>
                            )}
                          </form>

                          {/* Delete */}
                          <form action={deleteTest}>
                            <input
                              type="hidden"
                              name="testId"
                              value={test.id}
                            />

                            <button
                              type="submit"
                              className="bg-red-800 text-white px-3 py-2 rounded-lg hover:bg-red-900"
                            >
                              Delete
                            </button>
                          </form>

                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}