"use client"

import { motion } from "framer-motion"
import { Building2, TrendingUp, Clock, Target, ArrowRight, Zap, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"

interface DashboardViewProps {
  userName?: string
  userImage?: string | null
}

export default function DashboardView({ userName, userImage }: DashboardViewProps) {
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-teal-500/30">
        
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[600px] bg-teal-500/5 rounded-[100%] blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-500/5 rounded-[100%] blur-[120px] translate-y-1/3" />
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                  <Image src="/logo.png" alt="Negotium" fill className="object-cover" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white/90">NEGOTIUM</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-white hover:text-teal-400 transition-colors relative"
                >
                  Dashboard
                  <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />
                </Link>
                <Link 
                  href="/scenarios" 
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  Scenarios
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                  {userImage && (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                       <Image src={userImage} alt="User" fill className="object-cover" />
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
          <motion.div variants={item} className="flex items-end justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Command Center
              </h1>
              <p className="text-white/50 text-lg max-w-2xl">
                Track your negotiation performance and neural alignment scores.
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Clock className="w-4 h-4" />
              <span>Last synced: Just now</span>
            </button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={item} className="grid md:grid-cols-4 gap-6 mb-12">
             <StatsCard 
               label="Overall Score" 
               value="--" 
               icon={<TrendingUp className="w-5 h-5 text-teal-400" />}
               trend="+0%"
             />
             <StatsCard 
               label="Sessions Run" 
               value="0" 
               icon={<Target className="w-5 h-5 text-purple-400" />}
             />
             <StatsCard 
               label="Time Invested" 
               value="0h" 
               icon={<Clock className="w-5 h-5 text-amber-400" />}
             />
             <StatsCard 
               label="Scenarios Done" 
               value="0" 
               icon={<Building2 className="w-5 h-5 text-cyan-400" />}
             />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
               {/* Quick Start Hero */}
               <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900/20 to-black border border-teal-500/20 p-8 group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.1),transparent_50%)]" />
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
                      <Zap className="w-3 h-3" />
                      RECOMMENDED ACTION
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">Start New Simulation</h2>
                    <p className="text-white/60 mb-8 max-w-lg">
                      Launch a new training scenario. Our AI will adapt to your difficulty level automatically.
                    </p>
                    
                    <div className="flex gap-4">
                      <Link 
                        href="/scenarios"
                        className="px-6 py-3 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Initialize Session
                      </Link>
                      <button className="px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
                        View History
                      </button>
                    </div>
                  </div>
               </motion.div>

               {/* Recent Activity */}
               <motion.div variants={item} className="bg-[#111] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-white/50" />
                    Recent Activity
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                             <Target className="w-5 h-5 text-teal-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white/90">Account Created</h4>
                            <p className="text-xs text-white/40">Welcome to Negotium</p>
                          </div>
                       </div>
                       <span className="text-xs text-white/30 font-mono">Just now</span>
                    </div>
                  </div>
               </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
               {/* DNA Card */}
               <motion.div variants={item} className="bg-[#111] border border-white/5 rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center mb-6 relative">
                     <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-[spin_10s_linear_infinite]" />
                     <Target className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Negotiation DNA</h3>
                  <p className="text-white/40 text-sm mb-6 max-w-[200px]">
                    Complete 3 sessions to unlock your behavioral profile.
                  </p>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                     <div className="w-[10%] h-full bg-purple-500" />
                  </div>
                  <span className="text-xs text-purple-400 mt-2 font-mono">10% ANALYZED</span>
               </motion.div>

               {/* Quick Tips */}
               <motion.div variants={item} className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-3xl p-6">
                  <h4 className="font-bold text-amber-400 mb-2 text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" /> PRO TIP
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    "Anchoring high early in the negotiation often leads to better final outcomes, even if rejected initially."
                  </p>
               </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function StatsCard({ icon, label, value, trend }: any) {
  return (
    <div className="group bg-[#111] border border-white/5 p-6 rounded-2xl hover:border-teal-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/40 text-sm font-medium">{label}</span>
        <div className="p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {trend && <span className="text-xs font-mono text-teal-400 mb-1.5 bg-teal-500/10 px-1.5 py-0.5 rounded">{trend}</span>}
      </div>
    </div>
  )
}
