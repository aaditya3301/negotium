"use client"

import { motion } from "framer-motion"
import { Clock, DollarSign, Briefcase, Users, MessageSquare, ArrowRight, Filter, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface ScenariosViewProps {
  userName?: string
  userImage?: string | null
}

export default function ScenariosView({ userName, userImage }: ScenariosViewProps) {
  const [filter, setFilter] = useState("all")

  const scenarios = [
    {
      id: "salary_raise",
      title: "Annual Salary Raise",
      description: "Negotiate a merit-based raise during your performance review with a budget-conscious manager.",
      icon: DollarSign,
      duration: "15 min",
      difficulty: "Medium",
      color: "teal",
      tags: ["Career", "Internal"]
    },
    {
      id: "promotion",
      title: "Promotion Discussion",
      description: "Make your case for a promotion to the next level while addressing manager concerns.",
      icon: Briefcase,
      duration: "20 min",
      difficulty: "Medium",
      color: "purple",
      tags: ["Career", "Growth"]
    },
    {
      id: "client_negotiation",
      title: "Client Rate Increase",
      description: "Justify and negotiate higher consulting rates with a long-term client considering cheaper alternatives.",
      icon: Users,
      duration: "18 min",
      difficulty: "Hard",
      color: "amber",
      tags: ["Sales", "External"]
    },
    {
      id: "entry_salary",
      title: "Entry-Level Offer",
      description: "Negotiate your starting salary for your first professional role without seeming greedy.",
      icon: DollarSign,
      duration: "12 min",
      difficulty: "Beginner",
      color: "cyan",
      tags: ["Career", "Entry"]
    },
    {
      id: "counter_offer",
      title: "Counter-Offer Response",
      description: "You received a compelling competing offer. Learn to leverage it ethically without burning bridges.",
      icon: MessageSquare,
      duration: "16 min",
      difficulty: "Advanced",
      color: "red",
      tags: ["Career", "Strategy"]
    },
    {
      id: "remote_work",
      title: "Remote Work Arrangement",
      description: "Negotiate flexible work arrangements with a manager who prefers in-office collaboration.",
      icon: Users,
      duration: "14 min",
      difficulty: "Beginner",
      color: "teal",
      tags: ["Lifestyle", "Policy"]
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const getColorClass = (color: string) => {
    const colors: {[key: string]: string} = {
      teal: "text-teal-400 bg-teal-500/10 border-teal-500/20 group-hover:border-teal-500/40",
      purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40",
      amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40",
      cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40",
      red: "text-red-400 bg-red-500/10 border-red-500/20 group-hover:border-red-500/40",
    }
    return colors[color] || colors.teal
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-teal-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[1000px] h-[600px] bg-indigo-500/5 rounded-[100%] blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal-500/5 rounded-[100%] blur-[120px] translate-y-1/3" />
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                  <Image src="/logo.png" alt="Negotium" fill className="object-contain" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white/90">NEGOTIUM</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/scenarios" 
                  className="text-sm font-medium text-white hover:text-teal-400 transition-colors relative"
                >
                  Scenarios
                  <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                   {userImage && (
                     <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <Image src={userImage} alt="User" fill className="object-contain" />
                     </div>
                   )}
                   <span className="text-sm font-medium text-white/70">{userName}</span>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
             </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 py-32 max-w-7xl">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Scenario Library
              </h1>
              <p className="text-white/50 text-lg max-w-2xl">
                Choose a simulation environment. Each scenario is powered by a distinct neural agent personality.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-1">
              {['All', 'Career', 'Sales', 'Strategy'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f.toLowerCase() 
                    ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios
              .filter(s => filter === 'all' || s.tags.some(t => t.toLowerCase() === filter))
              .map((scenario) => (
              <Link 
                href={`/negotiation/new?scenario=${scenario.id}&difficulty=${scenario.difficulty.toLowerCase()}`}
                key={scenario.id} 
                className="group relative bg-[#111] border border-white/5 rounded-3xl p-8 hover:border-teal-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-900/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 border ${getColorClass(scenario.color)}`}>
                      <scenario.icon className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-medium border border-white/10 bg-white/5 text-white/50 group-hover:border-white/20 group-hover:text-white/80 transition-colors">
                      {scenario.difficulty.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 group-hover:text-teal-400 transition-colors">{scenario.title}</h3>
                  <p className="text-white/40 text-sm mb-8 leading-relaxed flex-grow">
                    {scenario.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-white/30 text-xs font-mono">
                      <Clock className="w-3 h-3" />
                      {scenario.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                      Initialize <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
