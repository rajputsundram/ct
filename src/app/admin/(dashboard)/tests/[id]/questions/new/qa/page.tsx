import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function addQaQuestion(formData: FormData) {
'use server'

const testId = Number(formData.get('testId'))
const question = formData.get('question') as string
const modelAnswer = formData.get('modelAnswer') as string
const marks = Number(formData.get('marks'))
const questionOrder = Number(formData.get('questionOrder'))

const { error } = await supabaseServer
.from('questions')
.insert({
test_id: testId,
question_type: 'QA',
question,
model_answer: modelAnswer,
marks,
question_order: questionOrder,
})

if (error) {
throw new Error(error.message)
}

redirect(`/admin/tests/${testId}/questions`)
}

export default async function NewQaQuestionPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

return (
<main className="min-h-screen bg-gray-100 p-8">
<h1 className="text-3xl font-bold mb-8">
Add Question & Answer
</h1>

  <form
    action={addQaQuestion}
    className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-6"
  >
    <input type="hidden" name="testId" value={id} />

    <div>
      <label className="block mb-2 font-medium">Question</label>
      <textarea
        name="question"
        className="w-full border rounded-lg p-3 h-32"
        placeholder="Explain the function of CPU in a computer."
        required
      />
    </div>

    <div>
      <label className="block mb-2 font-medium">
        Official / Model Answer
      </label>
      <textarea
        name="modelAnswer"
        className="w-full border rounded-lg p-3 h-48"
        placeholder="The CPU (Central Processing Unit) is the brain of the computer. It processes instructions, performs calculations, and controls the operations of all parts of the computer."
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 font-medium">Marks</label>
        <input
          name="marks"
          type="number"
          defaultValue="5"
          min="1"
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Question Order</label>
        <input
          name="questionOrder"
          type="number"
          defaultValue="1"
          min="1"
          className="w-full border rounded-lg p-3"
          required
        />
      </div>
    </div>

    <button
      type="submit"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Save Question & Answer
    </button>
  </form>
</main>

)
}