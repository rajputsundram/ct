import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function ResultsPage() {
const { data: classes } = await supabaseServer
.from('classes')
.select('id, class_name')
.order('class_name')

const { data: tests } = await supabaseServer
.from('tests')
.select('id, test_title, test_date, class_id')
.order('test_date', { ascending: false })

return (
<main className="min-h-screen bg-gray-100 p-8">
<h1 className="text-3xl font-bold mb-8">
Class-wise Results
</h1>

  <div className="grid md:grid-cols-2 gap-6">
    {classes?.map((cls) => {
      const classTests =
        tests?.filter(
          (t) => t.class_id === cls.id
        ) || []

      return (
        <div
          key={cls.id}
          className="bg-white p-6 rounded-xl shadow"
        >
          <h2 className="text-2xl font-semibold mb-4">
            {cls.class_name}
          </h2>

          {classTests.length > 0 ? (
            <div className="space-y-3">
              {classTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">
                      {test.test_title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {test.test_date}
                    </p>
                  </div>

                  <Link
                    href={`/admin/results/${cls.id}/${test.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Results
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No tests available for this class.
            </p>
          )}
        </div>
      )
    })}
  </div>
</main>

)
}