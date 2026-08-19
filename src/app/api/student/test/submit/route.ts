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

/*
  --------------------------------
  GEMINI QA EVALUATION
  --------------------------------
*/

async function evaluateQaAnswer(
  question: string,
  modelAnswer: string,
  studentAnswer: string,
  maxMarks: number
): Promise<number> {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    console.log('------------------------------------')
    console.log('QA EVALUATION START')
    console.log('Question:', question)
    console.log('Model Answer:', modelAnswer)
    console.log('Student Answer:', studentAnswer)
    console.log('Maximum Marks:', maxMarks)
    console.log('Gemini Key Exists:', !!apiKey)
    console.log('------------------------------------')

    /*
      --------------------------------
      CHECK API KEY
      --------------------------------
    */

    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing')
      return 0
    }

    /*
      --------------------------------
      CHECK MODEL ANSWER
      --------------------------------
    */

    if (!modelAnswer || !modelAnswer.trim()) {
      console.error(
        'Model answer is empty. Cannot evaluate QA.'
      )

      return 0
    }

    /*
      --------------------------------
      CHECK STUDENT ANSWER
      --------------------------------
    */

    if (!studentAnswer || !studentAnswer.trim()) {
      console.log('Student answer is empty')
      return 0
    }

    /*
      --------------------------------
      CHECK MAXIMUM MARKS
      --------------------------------
    */

    if (!maxMarks || maxMarks <= 0) {
      console.error(
        'Invalid maximum marks:',
        maxMarks
      )

      return 0
    }

    /*
      --------------------------------
      GEMINI PROMPT
      --------------------------------
    */

    const prompt = `
You are grading a school Computer Science examination answer.

Question:
${question}

Model Answer:
${modelAnswer}

Student Answer:
${studentAnswer}

Maximum Marks:
${maxMarks}

Evaluate the student's answer based on meaning, correctness, and understanding.

Rules:
1. Do not require exact wording from the model answer.
2. Accept different wording if the meaning is correct.
3. Ignore minor spelling, grammar, punctuation, and English mistakes.
4. Give full marks when the student correctly provides the required concept.
5. Give partial marks when the student demonstrates only part of the required knowledge.
6. Give zero marks when the answer is incorrect, irrelevant, or demonstrates no understanding.
7. Do not award marks just because some words match.
8. Do not penalize a student merely because their answer is shorter.
9. A short but correct answer can receive full marks when the question asks for one concept or feature.
10. The score must be between 0 and ${maxMarks}.
11. Decimal scores are allowed.

Return ONLY the numerical score.

Do not return:
- explanations
- words
- JSON
- markdown
- "marks"

Examples of valid output:
0
1
1.5
2
3
4

Now return only the score.
`

    console.log('Sending request to Gemini...')

    /*
      --------------------------------
      GEMINI API REQUEST
      --------------------------------
    */

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0,
            maxOutputTokens: 100,
            responseMimeType: 'text/plain',
          },
        }),
      }
    )

    console.log(
      'Gemini HTTP Status:',
      response.status
    )

    /*
      --------------------------------
      READ GEMINI RESPONSE
      --------------------------------
    */

    const data = await response.json()

    console.log(
      'Gemini Full Response:',
      JSON.stringify(data, null, 2)
    )

    /*
      --------------------------------
      GEMINI API ERROR
      --------------------------------
    */

    if (!response.ok) {
      console.error(
        'Gemini API Error:',
        data
      )

      return 0
    }

    /*
      --------------------------------
      EXTRACT GEMINI ANSWER
      --------------------------------
    */

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text

    console.log(
      'Gemini Raw Answer:',
      text
    )

    /*
      --------------------------------
      NO GEMINI ANSWER
      --------------------------------
    */

    if (!text) {
      console.error(
        'Gemini did not return a score.'
      )

      console.error(
        'Finish Reason:',
        data?.candidates?.[0]?.finishReason
      )

      return 0
    }

    /*
      --------------------------------
      CLEAN RESPONSE
      --------------------------------
    */

    const cleanedText = String(text)
      .trim()
      .replace(',', '.')

    console.log(
      'Cleaned Gemini Answer:',
      cleanedText
    )

    /*
      --------------------------------
      EXTRACT NUMBER
      --------------------------------
    */

    const match = cleanedText.match(
      /-?\d+(?:\.\d+)?/
    )

    if (!match) {
      console.error(
        'Could not extract score from Gemini:',
        cleanedText
      )

      return 0
    }

    const score = Number(match[0])

    console.log(
      'Gemini Parsed Score:',
      score
    )

    /*
      --------------------------------
      VALIDATE SCORE
      --------------------------------
    */

    if (!Number.isFinite(score)) {
      console.error(
        'Gemini returned invalid score:',
        score
      )

      return 0
    }

    /*
      --------------------------------
      LIMIT SCORE
      --------------------------------
    */

    const finalScore = Math.max(
      0,
      Math.min(
        maxMarks,
        score
      )
    )

    console.log(
      'Final QA Score:',
      finalScore
    )

    console.log(
      'QA EVALUATION END'
    )

    console.log(
      '------------------------------------'
    )

    return finalScore
  } catch (error) {
    console.error(
      'Gemini QA Evaluation Error:',
      error
    )

    return 0
  }
}

/*
  ====================================
  SUBMIT TEST
  ====================================
*/

export async function POST(
  request: Request
) {
  try {
    /*
      --------------------------------
      CHECK STUDENT SESSION
      --------------------------------
    */

    const cookieStore = await cookies()

    const session =
      cookieStore.get('student_session')

    if (!session) {
      console.error(
        'Student session cookie not found.'
      )

      return NextResponse.json(
        {
          message: 'Not logged in',
        },
        {
          status: 401,
        }
      )
    }

    const studentId =
      Number(session.value)

    if (!studentId) {
      console.error(
        'Invalid student session:',
        session.value
      )

      return NextResponse.json(
        {
          message:
            'Invalid student session',
        },
        {
          status: 401,
        }
      )
    }

    /*
      --------------------------------
      READ REQUEST
      --------------------------------
    */

    const body = await request.json()

    const testId = body?.testId
    const answers = body?.answers

    console.log(
      'Submitting test:',
      {
        studentId,
        testId,
      }
    )

    if (!testId) {
      return NextResponse.json(
        {
          message:
            'Test ID is required',
        },
        {
          status: 400,
        }
      )
    }

    /*
      --------------------------------
      CHECK ANSWERS OBJECT
      --------------------------------
    */

    if (
      !answers ||
      typeof answers !== 'object'
    ) {
      console.error(
        'Answers object is missing or invalid:',
        answers
      )

      return NextResponse.json(
        {
          message:
            'Answers are required',
        },
        {
          status: 400,
        }
      )
    }

    /*
      --------------------------------
      FETCH QUESTIONS
      --------------------------------
    */

    const {
      data: questions,
      error: questionsError,
    } = await supabaseServer
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
        {
          message:
            questionsError.message,
        },
        {
          status: 500,
        }
      )
    }

    if (
      !questions ||
      questions.length === 0
    ) {
      console.error(
        'No questions found for test:',
        testId
      )

      return NextResponse.json(
        {
          message:
            'Questions not found',
        },
        {
          status: 404,
        }
      )
    }

    console.log(
      `Found ${questions.length} questions`
    )

    /*
      --------------------------------
      CALCULATE SCORE
      --------------------------------
    */

    let score = 0
    let totalMarks = 0

    for (const q of questions) {
      const marks =
        Number(q.marks) || 0

      totalMarks += marks

      const studentAnswer =
        answers?.[q.id]

      console.log(
        '------------------------------------'
      )

      console.log(
        'Checking Question:',
        {
          id: q.id,
          type: q.question_type,
          question: q.question,
          correctAnswer:
            q.correct_answer,
          modelAnswer:
            q.model_answer,
          marks,
          studentAnswer,
        }
      )

      /*
        --------------------------------
        UNANSWERED
        --------------------------------
      */

      if (
        studentAnswer === undefined ||
        studentAnswer === null ||
        String(studentAnswer).trim() === ''
      ) {
        console.log(
          'Question unanswered -> 0 marks'
        )

        continue
      }

      /*
        --------------------------------
        MCQ
        --------------------------------
      */

      if (
        q.question_type === 'MCQ'
      ) {
        const student =
          normalize(
            String(studentAnswer)
          )

        const correct =
          normalize(
            String(
              q.correct_answer || ''
            )
          )

        console.log(
          'MCQ comparison:',
          {
            student,
            correct,
          }
        )

        if (student === correct) {
          score += marks

          console.log(
            `MCQ correct -> +${marks}`
          )
        } else {
          console.log(
            'MCQ incorrect -> +0'
          )
        }
      }

      /*
        --------------------------------
        FILL IN THE BLANK
        --------------------------------
      */

      else if (
        q.question_type === 'FILL'
      ) {
        const student =
          normalize(
            String(studentAnswer)
          )

        const correct =
          normalize(
            String(
              q.correct_answer || ''
            )
          )

        console.log(
          'FILL comparison:',
          {
            student,
            correct,
          }
        )

        if (student === correct) {
          score += marks

          console.log(
            `FILL correct -> +${marks}`
          )
        } else {
          console.log(
            'FILL incorrect -> +0'
          )
        }
      }

      /*
        --------------------------------
        QUESTION & ANSWER
        --------------------------------
      */

      else if (
        q.question_type === 'QA'
      ) {
        console.log(
          'Starting Gemini QA evaluation...'
        )

        const aiScore =
          await evaluateQaAnswer(
            q.question || '',
            q.model_answer || '',
            String(studentAnswer),
            marks
          )

        score += aiScore

        console.log(
          `QA score: ${aiScore}/${marks}`
        )

        console.log(
          `Running total score: ${score}`
        )
      }

      /*
        --------------------------------
        UNKNOWN QUESTION TYPE
        --------------------------------
      */

      else {
        console.error(
          'Unknown question type:',
          q.question_type
        )
      }
    }

    /*
      --------------------------------
      FINAL SCORE
      --------------------------------
    */

    score = Math.max(
      0,
      Math.min(
        totalMarks,
        Number(
          score.toFixed(2)
        )
      )
    )

    console.log(
      '===================================='
    )

    console.log(
      'FINAL TEST RESULT:',
      {
        studentId,
        testId,
        score,
        totalMarks,
      }
    )

    console.log(
      '===================================='
    )

    /*
      --------------------------------
      SAVE RESULT
      --------------------------------
    */

    const {
      error: saveError,
    } = await supabaseServer
      .from('test_attempts')
      .upsert(
        {
          student_id: studentId,
          test_id: testId,
          answers,
          score,
          total_marks:
            totalMarks,
        },
        {
          onConflict:
            'student_id,test_id',
        }
      )

    if (saveError) {
      console.error(
        'Test attempt save error:',
        saveError
      )

      return NextResponse.json(
        {
          message:
            saveError.message,
        },
        {
          status: 500,
        }
      )
    }

    /*
      --------------------------------
      SUCCESS
      --------------------------------
    */

    return NextResponse.json({
      success: true,
      score,
      totalMarks,
    })
  } catch (error) {
    console.error(
      'Submit test error:',
      error
    )

    return NextResponse.json(
      {
        message:
          'Something went wrong while checking the test.',
      },
      {
        status: 500,
      }
    )
  }
}