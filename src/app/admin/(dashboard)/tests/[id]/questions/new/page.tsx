import Link from 'next/link'

export default async function NewQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const questionTypes = [
    {
      name: 'MCQ',
      description: 'Multiple Choice Questions',
      href: `/admin/tests/${id}/questions/new/mcq`,
    },
    {
      name: 'Fill in the Blanks',
      description: 'Short answer with one correct answer',
      href: `/admin/tests/${id}/questions/new/fill`,
    },
    {
      name: 'Match the Following',
      description: 'Match left and right columns',
      href: `/admin/tests/${id}/questions/new/match`,
    },
    {
      name: 'Question & Answer',
      description: 'Long answer evaluated by AI',
      href: `/admin/tests/${id}/questions/new/qa`,
    },
  ]

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Choose Question Type</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {questionTypes.map((type) => (
          <Link
            key={type.name}
            href={type.href}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{type.name}</h2>
            <p className="text-gray-600">{type.description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}