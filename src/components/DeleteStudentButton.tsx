'use client'

export default function DeleteStudentButton({
studentId,
studentName,
}: {
studentId: number
studentName: string
}) {
async function handleDelete() {
const confirmed = window.confirm(
  `Are you sure you want to delete ${studentName}?`
)

if (!confirmed) return

const res = await fetch(`/admin/students/${studentId}/delete`, {
  method: 'POST',
})

if (res.redirected) {
  window.location.href = res.url
} else {
  window.location.reload()
}

}

return (
<button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700" >
Delete
</button>
)
}