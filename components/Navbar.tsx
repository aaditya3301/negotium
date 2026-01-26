"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, BarChart3, User, LogOut } from "lucide-react"

import Image from "next/image"

export default function Navbar({ userName }: { userName?: string }) {
  const pathname = usePathname()
  
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/scenarios", label: "Practice", icon: Building2 },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-teal-800/30 bg-gray-900/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Negotium" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Negotium
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname?.startsWith(link.href)
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-teal-500/20 text-teal-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {userName && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-300">{userName}</span>
              </div>
            )}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
