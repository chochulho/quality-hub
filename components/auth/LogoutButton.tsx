'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LogoutButtonProps {
  className?: string
  showIcon?: boolean
}

export default function LogoutButton({ className = '', showIcon = true }: LogoutButtonProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {showIcon && <LogOut className="h-3.5 w-3.5" />}
      로그아웃
    </button>
  )
}
