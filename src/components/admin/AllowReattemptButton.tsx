'use client'

export default function AllowReattemptButton({
studentName,
}: {
studentName: string
}) {
return (
<button
type="submit"
className="bg-orange-600 text-white px-3 py-2 rounded-lg hover"
onClick={(e) => {
const ok = window.confirm(`Allow ${studentName} to reattempt this test?\\n\\nThis will remove the current submission and the student will be able to take the test again.
`)

    if (!ok) {
      e.preventDefault()
    }
  }}
>
  Allow Reattempt
</button>

)
}