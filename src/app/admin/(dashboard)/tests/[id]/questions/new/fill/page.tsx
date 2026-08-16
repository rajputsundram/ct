import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function addFillQuestion(formData: FormData) {
'use server'

const testId = Number(formData.get('testId'))
const question = formData.get('question') as string
const correctAnswer = formData.get('correctAnswer') as string
const marks = Number(formData.get('marks'))
const questionOrder = Number(formData.get('questionOrder'))

const { error } = await supabaseServer
.from('questions')
.insert({
test_id: testId,
question_type: 'FILL',
question,
correct_answer: correctAnswer.trim().toLowerCase(),
marks,
question_order: questionOrder,
})

if (error) {
throw new Error(error.message)
}

redirect(`/admin/tests/${testId}/questions`)
}

export default async function NewFillQuestionPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

return (
<main className="min-h-screen bg-gray-100 p-8">
<h1 className="text-3xl font-bold mb-8">
Add Fill in the Blanks Question
</h1>

  <form
    action={addFillQuestion}
    className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-6"
  >
    <input type="hidden" name="testId" value={id} />

    <div>
      <label className="block mb-2 font-medium">Question</label>
      <textarea
        name="question"
        className="w-full border rounded-lg p-3 h-24"
        placeholder="Example: The CPU is called the ______ of the computer."
        required
      />
    </div>

    <div>
      <label className="block mb-2 font-medium">Correct Answer</label>
      <input
        name="correctAnswer"
        className="w-full border rounded-lg p-3"
        placeholder="brain"
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 font-medium">Marks</label>
        <input
          name="marks"
          type="number"
          defaultValue="1"
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
      Save Fill in the Blanks Question
    </button>
  </form>
</main>

)
}