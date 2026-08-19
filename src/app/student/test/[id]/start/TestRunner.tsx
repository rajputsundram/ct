'use client'

import { useEffect, useMemo, useState } from 'react'

type Question = {
  id: number
  question: string
  question_type: 'MCQ' | 'FILL' | 'QA'
  options?: {
    A: string
    B: string
    C: string
    D: string
  }
  marks: number
}

export default function TestRunner({
  testId,
  durationMinutes,
  questions,
}: {
  testId: number
  durationMinutes: number
  questions: Question[]
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] =
    useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] =
    useState(durationMinutes * 60)
  const [submitting, setSubmitting] =
    useState(false)

  /*
    --------------------------------
    SAVE ANSWER
    --------------------------------
  */

  function setAnswer(value: string) {
    const question =
      questions[currentIndex]

    if (!question) return

    setAnswers((prev) => {
      const updated = {
        ...prev,
        [question.id]: value,
      }

      console.log(
        'ANSWER SAVED:',
        {
          questionId: question.id,
          questionType:
            question.question_type,
          value,
          allAnswers: updated,
        }
      )

      return updated
    })
  }

  /*
    --------------------------------
    SUBMIT TEST
    --------------------------------
  */

  async function handleSubmit() {
    if (submitting) return

    setSubmitting(true)

    console.log(
      '===================================='
    )

    console.log(
      'SUBMITTING TEST'
    )

    console.log(
      'Test ID:',
      testId
    )

    console.log(
      'Answers:',
      answers
    )

    console.log(
      'Answer Keys:',
      Object.keys(answers)
    )

    console.log(
      '===================================='
    )

    try {
      const res = await fetch(
        '/api/student/test/submit',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            testId,
            answers,
          }),
        }
      )

      const data =
        await res.json()

      console.log(
        'SUBMIT RESPONSE:',
        data
      )

      if (!res.ok) {
        alert(
          data.message ||
            'Failed to submit test'
        )

        setSubmitting(false)
        return
      }

      alert(
        `Test submitted successfully!\n\nYour Score: ${data.score} / ${data.totalMarks}`
      )

      window.location.href =
        '/student'
    } catch (error) {
      console.error(
        'Submit error:',
        error
      )

      alert(
        'Something went wrong while submitting the test.'
      )

      setSubmitting(false)
    }
  }

  /*
    --------------------------------
    TIMER
    --------------------------------
  */

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (prev) => prev - 1
        )
      }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [timeLeft])

  /*
    --------------------------------
    EMPTY QUESTIONS
    --------------------------------
  */

  if (
    !questions ||
    questions.length === 0
  ) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h1 className="text-2xl font-bold mb-4">
            No questions available
          </h1>

          <p className="text-gray-600">
            This test does not have any
            questions yet.
          </p>
        </div>
      </main>
    )
  }

  const currentQuestion =
    questions[currentIndex]

  /*
    --------------------------------
    CURRENT ANSWER
    --------------------------------
  */

  const currentAnswer =
    answers[currentQuestion.id] || ''

  /*
    --------------------------------
    TIME
    --------------------------------
  */

  const minutes =
    Math.floor(timeLeft / 60)

  const seconds =
    timeLeft % 60

  /*
    --------------------------------
    ANSWERED COUNT
    --------------------------------
  */

  const answeredCount =
    useMemo(() => {
      return Object.values(
        answers
      ).filter(
        (answer) =>
          String(answer).trim() !== ''
      ).length
    }, [answers])

  /*
    --------------------------------
    RENDER
    --------------------------------
  */

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Test
            </h1>

            <p className="text-gray-600">
              Question{' '}
              {currentIndex + 1} of{' '}
              {questions.length}
            </p>
          </div>

          <div className="text-right">

            <p className="text-sm text-gray-600">
              Time Left
            </p>

            <p className="text-3xl font-bold text-red-600">
              {String(
                minutes
              ).padStart(2, '0')}
              :
              {String(
                seconds
              ).padStart(2, '0')}
            </p>

          </div>
        </div>

        {/* QUESTION */}

        <div className="bg-white p-6 rounded-xl shadow mb-6">

          <div className="flex justify-between items-start mb-4">

            <h2 className="text-xl font-semibold">
              Q{currentIndex + 1}.{' '}
              {currentQuestion.question}
            </h2>

            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {currentQuestion.marks}{' '}
              Marks
            </span>

          </div>

          {/* MCQ */}

          {currentQuestion.question_type ===
            'MCQ' && (
            <div className="space-y-3">

              {(
                [
                  'A',
                  'B',
                  'C',
                  'D',
                ] as const
              ).map((key) => (

                <label
                  key={key}
                  className="flex items-center gap-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                >

                  <input
                    type="radio"
                    name={`q_${currentQuestion.id}`}
                    checked={
                      currentAnswer ===
                      key
                    }
                    onChange={() =>
                      setAnswer(key)
                    }
                  />

                  <span>
                    {
                      currentQuestion
                        .options?.[key]
                    }
                  </span>

                </label>

              ))}

            </div>
          )}

          {/* FILL */}

          {currentQuestion.question_type ===
            'FILL' && (

            <input
              type="text"
              value={currentAnswer}
              onChange={(e) =>
                setAnswer(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
              placeholder="Type your answer here"
            />

          )}

          {/* QUESTION ANSWER */}

          {currentQuestion.question_type ===
            'QA' && (

            <div>

              <textarea
                value={currentAnswer}
                onChange={(e) => {
                  const value =
                    e.target.value

                  setAnswer(value)

                  console.log(
                    'QA ANSWER TYPED:',
                    {
                      questionId:
                        currentQuestion.id,
                      value,
                    }
                  )
                }}
                className="w-full border rounded-lg p-3 h-40"
                placeholder="Write your answer here"
              />

              <p className="text-sm text-gray-500 mt-2">
                Your answer is saved automatically.
              </p>

            </div>

          )}

        </div>

        {/* NAVIGATION */}

        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">

          <button
            onClick={() =>
              setCurrentIndex(
                (i) =>
                  Math.max(
                    i - 1,
                    0
                  )
              )
            }
            disabled={
              currentIndex === 0 ||
              submitting
            }
            className="bg-gray-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Answered {answeredCount} /{' '}
            {questions.length}
          </div>

          {currentIndex ===
          questions.length - 1 ? (

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {submitting
                ? 'Submitting...'
                : 'Submit Test'}
            </button>

          ) : (

            <button
              onClick={() =>
                setCurrentIndex(
                  (i) =>
                    Math.min(
                      i + 1,
                      questions.length - 1
                    )
                )
              }
              disabled={submitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              Next
            </button>

          )}

        </div>

      </div>
    </main>
  )
}