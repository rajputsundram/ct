'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menu = [
{ name: 'Dashboard', href: '/admin' },
{ name: 'Classes', href: '/admin/classes' },
{ name: 'Students', href: '/admin/students' },
{ name: 'Tests', href: '/admin/tests' },
{ name: 'Results', href: '/admin/results' },
]

export default function AdminSidebar() {
const pathname = usePathname()

return (
<aside className="w-64 min-h-screen bg-gray-900 text-white">
<div className="p-6 border-b border-gray-700">
<h2 className="text-2xl font-bold">
Admin Panel
</h2>
</div>

  <nav className="p-4 space-y-2">
    {menu.map((item) => {
      const active = pathname === item.href

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`block px-4 py-3 rounded-lg transition ${
            active
              ? 'bg-blue-600'
              : 'hover:bg-gray-800'
          }`}
        >
          {item.name}
        </Link>
      )
    })}
  </nav>

  <div className="p-4 mt-auto border-t border-gray-700">
    <Link
      href="/admin/logout"
      className="block px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-center"
    >
      Logout
    </Link>
  </div>
</aside>

)
}