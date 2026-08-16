import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
const cookieStore = await cookies()

const session = cookieStore.get('admin_session')

if (!session) {
redirect('/admin/login')
}

return (
<main className="min-h-screen bg-gray-100 p-8">
<div className="flex justify-between items-center mb-8">
<h1 className="text-3xl font-bold">Admin Dashboard</h1>

    <a
      href="/admin/logout"
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
    >
      Logout
    </a>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Link href="/admin/students" className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">Students</h2>
      <p>Add and manage students</p>
    </Link>

    <Link href="/admin/tests" className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">Tests</h2>
      <p>Create class-wise Computer tests</p>
    </Link>

    <Link href="/admin/results" className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">Results</h2>
      <p>View class-wise results</p>
    </Link>

    <Link href="/admin/question-bank" className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">Question Bank</h2>
      <p>Manage Computer questions</p>
    </Link>
  </div>
</main>

)
}