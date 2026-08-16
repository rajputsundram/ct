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
    console.log('GEMINI KEY EXISTS:', !!process.env.GEMINI_API_KEY)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `
You are an experienced and fair school Computer Science teacher evaluating a student's exam answer.

Your job is to award marks fairly based on the student's actual understanding of the question.

IMPORTANT MARKING RULES:

1. Evaluate the MEANING of the student's answer, not exact word matching.
2. Do NOT require the student to use the same words or sentences as the official answer.
3. Accept different wording, sentence structure, terminology, and valid explanations when they communicate the same concept.
4. Ignore minor spelling, grammar, punctuation, or English-language mistakes when the intended technical meaning is clear.
5. Award FULL marks when the student demonstrates all important concepts required by the question.
6. Award PARTIAL marks when the student demonstrates some, but not all, of the required concepts.
7. Give ZERO marks when the answer is incorrect, irrelevant, or does not demonstrate understanding of the question.
8. Do not give marks merely because the student's answer contains words that appear in the official answer.
9. Do not give marks for irrelevant or meaningless extra information.
10. If the student gives both correct and incorrect information, consider the incorrect information when deciding the final score.
11. Do not assume that the student knows something unless their answer demonstrates it.
12. Consider the maximum marks when deciding how much of the concept is required.
13. For a simple one-point question, a concise correct answer can receive full marks.
14. For a question requiring multiple points, award marks according to how many important points the student correctly addresses.
15. Be consistent and fair, similar to how a knowledgeable human school teacher would mark the answer.
16. Never penalize a student simply because their answer is shorter than the official answer if it correctly contains the required concept.
17. Never award more than the maximum marks.
18. Never award less than zero marks.
19. The final score may be a decimal number when partial marks are appropriate.
20. Return ONLY the numerical score. Do not return explanations, JSON, markdown, words, or symbols.
`,
              },
            ],
          },

          contents: [
            {
              parts: [
                {
                  text: `
Question:
${question}

Official/Model Answer:
${modelAnswer}

Student Answer:
${studentAnswer}

Maximum Marks:
${maxMarks}

Evaluate the student's answer according to the marking rules and return ONLY the numerical score.
`,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'text/plain',
          },
        }),
      }
    )

    console.log('Gemini status:', response.status)

    const data = await response.json()

    console.log(
      'Gemini response:',
      JSON.stringify(data, null, 2)
    )

    if (!response.ok) {
      console.error('Gemini API error:', data)
      return 0
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? '0'

    /*
      Gemini might theoretically return something like:
      "1.5"
      or
      "1.5\n"

      Extract the first valid number.
    */
    const match = String(text).trim().match(/-?\d+(?:\.\d+)?/)

    if (!match) {
      console.error('Could not extract score from Gemini:', text)
      return 0
    }

    const score = Number(match[0])

    if (Number.isNaN(score)) {
      return 0
    }

    return Math.max(0, Math.min(maxMarks, score))
  } catch (err) {
    console.error('Gemini evaluation error:', err)
    return 0
  }
}

export async function POST(request: Request) {
  try {
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

    if (!testId) {
      return NextResponse.json(
        { message: 'Test ID is required' },
        { status: 400 }
      )
    }

    const { data: questions, error: questionsError } =
      await supabaseServer
        .from('questions')
        .select(`
          id,
          question,
          question_type,
          correct_answer,
          model_answer,
          marks
        `)
        .eq('test_id', testId)

    if (questionsError) {
      console.error(
        'Questions fetch error:',
        questionsError
      )

      return NextResponse.json(
        { message: questionsError.message },
        { status: 500 }
      )
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { message: 'Questions not found' },
        { status: 404 }
      )
    }

    let score = 0
    let totalMarks = 0

    for (const q of questions) {
      const marks = Number(q.marks) || 0

      totalMarks += marks

      const studentAnswer = answers?.[q.id]

      /*
        Student did not answer this question.
        Therefore, it receives zero marks.
      */
      if (
        studentAnswer === undefined ||
        studentAnswer === null ||
        String(studentAnswer).trim() === ''
      ) {
        continue
      }

      /*
        MCQ
      */
      if (q.question_type === 'MCQ') {
        if (
          normalize(String(studentAnswer)) ===
          normalize(String(q.correct_answer || ''))
        ) {
          score += marks
        }
      }

      /*
        Fill in the blanks
      */
      else if (q.question_type === 'FILL') {
        if (
          normalize(String(studentAnswer)) ===
          normalize(String(q.correct_answer || ''))
        ) {
          score += marks
        }
      }

      /*
        Question & Answer
        Gemini evaluates meaning, correctness,
        completeness and partial understanding.
      */
      else if (q.question_type === 'QA') {
        const aiScore = await evaluateQaAnswer(
          q.question || '',
          q.model_answer || '',
          String(studentAnswer),
          marks
        )

        score += aiScore
      }
    }

    /*
      Prevent accidental floating-point values
      outside the valid range.
    */
    score = Math.max(
      0,
      Math.min(totalMarks, Number(score.toFixed(2)))
    )

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
      console.error(
        'Test attempt save error:',
        error
      )

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
  } catch (err) {
    console.error(
      'Submit test error:',
      err
    )

    return NextResponse.json(
      { message: 'Something went wrong while checking the test.' },
      { status: 500 }
    )
  }
}