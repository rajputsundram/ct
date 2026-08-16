import Link from 'next/link'

export default function HomePage() {
return (
<main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
{/* Header */}
<header className="w-full border-b bg-white/80 backdrop-blur">
<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
<div>
<h1 className="text-2xl font-bold text-blue-700">
AI Computer Test System
</h1>
<p className="text-sm text-gray-500">
Smart online examination platform
</p>
</div>

      <div className="flex gap-3">
        <Link
          href="/student/login"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          Student Login
        </Link>

        <Link
          href="/admin/login"
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100"
        >
          Admin Login
        </Link>
      </div>
    </div>
  </header>

  {/* Hero */}
  <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-20 text-center">
    <div className="mb-8 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
      AI-powered examination and evaluation platform
    </div>

    <h2 className="max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900">
      Take computer tests online and get instant AI-based evaluation
    </h2>

    <p className="mt-6 max-w-2xl text-lg text-gray-600">
      Designed for schools and students. Attempt MCQ, Fill in the Blanks,
      and Question & Answer tests with automatic scoring and class-wise
      result management.
    </p>

    <div className="mt-10 flex flex-wrap justify-center gap-4">
      <Link
        href="/student/login"
        className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700"
      >
        Start as Student
      </Link>

      <Link
        href="/admin/login"
        className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-800 transition hover:bg-gray-100"
      >
        Admin Access
      </Link>
    </div>
  </section>

  {/* Features */}
  <section className="mx-auto max-w-7xl px-6 pb-16">
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          📘
        </div>
        <h3 className="mb-2 text-xl font-semibold">
          Multiple Question Types
        </h3>
        <p className="text-gray-600">
          Conduct MCQ, Fill in the Blanks, and descriptive Question &
          Answer tests in one platform.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          🤖
        </div>
        <h3 className="mb-2 text-xl font-semibold">
          AI Evaluation
        </h3>
        <p className="text-gray-600">
          Descriptive answers are compared with the model answer and graded
          automatically by AI.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          📊
        </div>
        <h3 className="mb-2 text-xl font-semibold">
          Class-wise Results
        </h3>
        <p className="text-gray-600">
          View student performance, percentages, submission status, and
          class-wise result reports instantly.
        </p>
      </div>
    </div>
  </section>

  {/* About Founder */}
  <section className="bg-white py-16">
    <div className="mx-auto max-w-4xl px-6 text-center">
      <h3 className="text-3xl font-bold text-gray-900">
        About the Founder
      </h3>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        This AI Computer Test System was created to help schools conduct
        computer examinations more efficiently through automatic evaluation,
        class-wise result management, and a simple student-friendly
        interface. The goal is to reduce manual checking work for teachers
        while giving students quick and accurate feedback.
      </p>
    </div>
  </section>

  {/* Footer */}
  <footer className="border-t bg-gray-900 py-8 text-center text-gray-400">
    <p>
      © 2026 AI Computer Test System. All rights reserved.
    </p>
  </footer>
</main>

)
}