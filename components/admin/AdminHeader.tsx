"use client"

import { signOut, useSession } from 'next-auth/react'
import { LogOut, User, Menu } from 'lucide-react'
import { useState } from 'react'

export default function AdminHeader() {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-parish-surface shadow-sm border-b border-parish-border sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button className="lg:hidden p-2 rounded-md text-parish-secondary hover:text-parish-text-light hover:bg-parish-primary">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1"></div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-parish-primary transition"
              >
                <div className="w-8 h-8 bg-parish-gold rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-parish-text">{session?.user?.name || 'Usuário'}</p>
                  <p className="text-xs text-parish-secondary">{session?.user?.role || 'USER'}</p>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-parish-surface rounded-lg shadow-parish border border-parish-border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-parish-text-light hover:bg-parish-primary"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
