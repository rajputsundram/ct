import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function addMcqQuestion(formData: FormData) {
'use server'

const testId = Number(formData.get('testId'))
const question = formData.get('question') as string
const optionA = formData.get('optionA') as string
const optionB = formData.get('optionB') as string
const optionC = formData.get('optionC') as string
const optionD = formData.get('optionD') as string
const correctAnswer = formData.get('correctAnswer') as string
const marks = Number(formData.get('marks'))
const questionOrder = Number(formData.get('questionOrder'))

const options = {
A: optionA,
B: optionB,
C: optionC,
D: optionD,
}

const { error } = await supabaseServer
.from('questions')
.insert({
test_id: testId,
question_type: 'MCQ',
question,
options,
correct_answer: correctAnswer,
marks,
question_order: questionOrder,
})

if (error) {
throw new Error(error.message)
}

redirect(`/admin/tests/${testId}/questions`)
}

export default async function NewMcqQuestionPage({
params,
}: {
params: Promise<{ id: string }>
}) {
const { id } = await params

return (
<main className="min-h-screen bg-gray-100 p-8">
<h1 className="text-3xl font-bold mb-8">Add MCQ Question</h1>

  <form
    action={addMcqQuestion}
    className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-6"
  >
    <input type="hidden" name="testId" value={id} />

    <div>
      <label className="block mb-2 font-medium">Question</label>
      <textarea
        name="question"
        className="w-full border rounded-lg p-3 h-24"
        placeholder="Enter your MCQ question"
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 font-medium">Option A</label>
        <input
          name="optionA"
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Option B</label>
        <input
          name="optionB"
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Option C</label>
        <input
          name="optionC"
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Option D</label>
        <input
          name="optionD"
          className="w-full border rounded-lg p-3"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 font-medium">Correct Answer</label>
        <select
          name="correctAnswer"
          className="w-full border rounded-lg p-3"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>

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

    <button
      type="submit"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Save MCQ Question
    </button>
  </form>
</main>

)
}