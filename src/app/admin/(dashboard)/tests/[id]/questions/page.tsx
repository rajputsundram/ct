import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function deleteQuestion(formData: FormData) {
'use server'

const questionId = Number(formData.get('questionId'))
const testId = Number(formData.get('testId'))

const { error } = await supabaseServer
.from('questions')
.delete()
.eq('id', questionId)

if (error) {
throw new Error(error.message)
}

redirect(`/admin/tests/${testId}/questions`)
}

export default async function QuestionsPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

const { data: test } = await supabaseServer
.from('tests')
.select( `*, classes ( class_name )` )
.eq('id', id)
.single()

const { data: questions } = await supabaseServer
.from('questions')
.select('*')
.eq('test_id', id)
.order('id')

return (
<main className="min-h-screen bg-gray-100 p-8">
<div className="flex justify-between items-center mb-8">
<div>
<h1 className="text-3xl font-bold">
{test?.test_title}
</h1>

      <p className="text-gray-600 mt-2">
        Class:{' '}
        {Array.isArray(test?.classes)
          ? test?.classes[0]?.class_name
          : test?.classes?.class_name}
        {' '}| Chapter: {test?.chapter}
      </p>
    </div>

    <Link
      href={`/admin/tests/${id}/questions/new`}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      Add Question
    </Link>
  </div>

  <div className="space-y-4">
    {questions?.map((q, index) => (
      <div
        key={q.id}
        className="bg-white p-6 rounded-xl shadow"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">
            Question {index + 1}
          </span>

          <span className="text-sm bg-gray-200 px-3 py-1 rounded-full">
            {q.question_type}
          </span>
        </div>

        <p className="text-lg">{q.question}</p>

        <p className="text-sm text-gray-600 mt-3">
          Marks: {q.marks}
        </p>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/admin/tests/${id}/questions/${q.id}/edit`}
            className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600"
          >
            Edit
          </Link>

          <form action={deleteQuestion}>
            <input
              type="hidden"
              name="questionId"
              value={q.id}
            />

            <input
              type="hidden"
              name="testId"
              value={id}
            />

            <button
              type="submit"
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    ))}
  </div>
</main>

)
}