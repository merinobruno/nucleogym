'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/admin/login')
      else setLoading(false)
    })
  }, [isLoginPage, router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (isLoginPage) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-gray-900">Núcleo Gym</span>
            <Link
              href="/admin/socios"
              className={`text-sm ${pathname.startsWith('/admin/socios') ? 'text-black font-medium' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Socios
            </Link>
            <Link
              href="/admin/ejercicios"
              className={`text-sm ${pathname.startsWith('/admin/ejercicios') ? 'text-black font-medium' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Ejercicios
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Salir
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
