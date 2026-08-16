'use client'

import { useState } from 'react'

export default function StudentLoginPage() {
const [admissionNumber, setAdmissionNumber] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

async function handleLogin(e: React.FormEvent) {
e.preventDefault()

setLoading(true)
setError('')

const res = await fetch('/api/student/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    admissionNumber,
    password,
  }),
})

const data = await res.json()

setLoading(false)

if (!res.ok) {
  setError(data.message)
  return
}

window.location.href = '/student'

}

return (
<main className="min-h-screen flex items-center justify-center bg-gray-100">
<form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow w-full max-w-md" >
<h1 className="text-3xl font-bold mb-6">Student Login</h1>

    {error && (
      <p className="text-red-600 mb-4">
        {error}
      </p>
    )}

    <div className="mb-4">
      <label className="block mb-2">Admission Number</label>
      <input
        type="text"
        value={admissionNumber}
        onChange={(e) => setAdmissionNumber(e.target.value)}
        className="w-full border rounded-lg p-3"
        placeholder="Enter admission number"
        required
      />
    </div>

    <div className="mb-6">
      <label className="block mb-2">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded-lg p-3"
        required
      />
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Logging in...' : 'Login'}
    </button>
  </form>
</main>

)
}