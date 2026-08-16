import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'

async function updateQuestion(formData: FormData) {
'use server'

const testId = Number(formData.get('testId'))
const questionId = Number(formData.get('questionId'))
const questionType = formData.get('questionType') as string

const question = formData.get('question') as string
const marks = Number(formData.get('marks'))

let updateData: Record<string, unknown> = {
question,
marks,
}

if (questionType === 'MCQ') {
updateData.options = {
A: formData.get('optionA'),
B: formData.get('optionB'),
C: formData.get('optionC'),
D: formData.get('optionD'),
}

updateData.correct_answer = formData.get('correctAnswer')

} else if (questionType === 'FILL') {
updateData.correct_answer = (
formData.get('correctAnswer') as string
)
.trim()
.toLowerCase()
} else if (questionType === 'QA') {
updateData.correct_answer = formData.get('modelAnswer')
}

const { error } = await supabaseServer
.from('questions')
.update(updateData)
.eq('id', questionId)

if (error) {
throw new Error(error.message)
}

redirect(`/admin/tests/${testId}/questions`)
}

export default async function EditQuestionPage({
params,
}: {
params: Promise<{
id: string
questionId: string
}>
}) {
const { id, questionId } = await params

const { data: question } = await supabaseServer
.from('questions')
.select('*')
.eq('id', Number(questionId))
.single()

if (!question) {
redirect(`/admin/tests/${id}/questions`)
}

const options =
typeof question.options === 'string'
? JSON.parse(question.options)
: question.options || {}

return (
<main className="min-h-screen bg-gray-100 p-8">
<h1 className="text-3xl font-bold mb-8">
Edit {question.question_type} Question
</h1>

  <form
    action={updateQuestion}
    className="bg-white p-6 rounded-xl shadow max-w-3xl space-y-6"
  >
    <input
      type="hidden"
      name="testId"
      value={id}
    />

    <input
      type="hidden"
      name="questionId"
      value={question.id}
    />

    <input
      type="hidden"
      name="questionType"
      value={question.question_type}
    />

    <div>
      <label className="block mb-2 font-medium">
        Question
      </label>

      <textarea
        name="question"
        defaultValue={question.question}
        className="w-full border rounded-lg p-3 h-32"
        required
      />
    </div>

    {question.question_type === 'MCQ' && (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">
              Option A
            </label>

            <input
              name="optionA"
              defaultValue={options.A}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Option B
            </label>

            <input
              name="optionB"
              defaultValue={options.B}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Option C
            </label>

            <input
              name="optionC"
              defaultValue={options.C}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Option D
            </label>

            <input
              name="optionD"
              defaultValue={options.D}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Correct Answer
          </label>

          <select
            name="correctAnswer"
            defaultValue={question.correct_answer}
            className="w-full border rounded-lg p-3"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
      </>
    )}

    {question.question_type === 'FILL' && (
      <div>
        <label className="block mb-2 font-medium">
          Correct Answer
        </label>

        <input
          name="correctAnswer"
          defaultValue={question.correct_answer}
          className="w-full border rounded-lg p-3"
          required
        />
      </div>
    )}

    {question.question_type === 'QA' && (
      <div>
        <label className="block mb-2 font-medium">
          Model Answer
        </label>

        <textarea
          name="modelAnswer"
          defaultValue={question.correct_answer}
          className="w-full border rounded-lg p-3 h-48"
          required
        />
      </div>
    )}

    <div>
      <label className="block mb-2 font-medium">
        Marks
      </label>

      <input
        name="marks"
        type="number"
        defaultValue={question.marks}
        min="1"
        className="w-full border rounded-lg p-3"
        required
      />
    </div>

    <div className="flex gap-4">
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Save Changes
      </button>

      <a
        href={`/admin/tests/${id}/questions`}
        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
      >
        Cancel
      </a>
    </div>
  </form>
</main>

)
}