import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

function normalize(text: string = '') {
return text
.toLowerCase()
.replace(/[.,!?;:()]/g, '')
.replace(/\s+/g, ' ')
.trim()
}

async function evaluateQaAnswer(
  question: string,
  modelAnswer: string,
  studentAnswer: string,
  maxMarks: number
): Promise<number> {
  try {
    // Exact match shortcut (free and instant)
    if (normalize(studentAnswer) === normalize(modelAnswer)) {
      return maxMarks
    }

    console.log('GEMINI KEY EXISTS:', !!process.env.GEMINI_API_KEY)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a strict but fair school exam evaluator.

Question:
${question}

Official Answer:
${modelAnswer}

Student Answer:
${studentAnswer}

Maximum Marks: ${maxMarks}

Instructions:
- Compare the student answer with the official answer.
- Award marks based on correctness, completeness, and understanding.
- Return ONLY a number between 0 and ${maxMarks}.
- Do not return any explanation, text, JSON, punctuation, or markdown.`,
                },
              ],
            },
          ],
        }),
      }
    )

    console.log('Gemini status:', response.status)

    const data = await response.json()
    console.log('Gemini response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      return 0
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? '0'

    const score = Number(String(text).trim())

    if (Number.isNaN(score)) return 0

    return Math.max(0, Math.min(maxMarks, score))
  } catch (err) {
    console.error('Gemini evaluation error:', err)
    return 0
  }
}

export async function POST(request: Request) {
const cookieStore = await cookies()
const session = cookieStore.get('student_session')

if (!session) {
return NextResponse.json(
{ message: 'Not logged in' },
{ status: 401 }
)
}

const studentId = Number(session.value)
const { testId, answers } = await request.json()

const { data: questions } = await supabaseServer
.from('questions')
.select(`       id,
      question,
      question_type,
      correct_answer,
      model_answer,
      marks
    `)
.eq('test_id', testId)

if (!questions) {
return NextResponse.json(
{ message: 'Questions not found' },
{ status: 404 }
)
}

let score = 0
let totalMarks = 0

for (const q of questions) {
const marks = q.marks || 0
totalMarks += marks

const studentAnswer = answers?.[q.id]

if (!studentAnswer) continue

if (q.question_type === 'MCQ') {
  if (studentAnswer === q.correct_answer) {
    score += marks
  }
} else if (q.question_type === 'FILL') {
  if (
    normalize(studentAnswer) ===
    normalize(q.correct_answer || '')
  ) {
    score += marks
  }
} else if (q.question_type === 'QA') {
  const aiScore = await evaluateQaAnswer(
    q.question || '',
    q.model_answer || '',
    studentAnswer,
    marks
  )

  score += aiScore
}


}

const { error } = await supabaseServer
.from('test_attempts')
.upsert(
{
student_id: studentId,
test_id: testId,
answers,
score,
total_marks: totalMarks,
},
{
onConflict: 'student_id,test_id',
}
)

if (error) {
return NextResponse.json(
{ message: error.message },
{ status: 500 }
)
}

return NextResponse.json({
success: true,
score,
totalMarks,
})
}
