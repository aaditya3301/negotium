"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Send, ArrowLeft, Loader2, MessageCircle, TrendingUp, Clock, Pause, Play, X, Zap, Target, BrainCircuit, Mic } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  role: "user" | "assistant"
  content: string
}

const scenarioDurations: Record<string, number> = {
  "salary_raise": 15,
  "promotion": 20,
  "client_negotiation": 18,
  "entry_salary": 12,
  "counter_offer": 16,
  "remote_work": 14,
}

export default function NegotiationChat() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenario = searchParams.get("scenario") || "salary_raise"
  const difficulty = searchParams.get("difficulty") || "beginner"

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  
  // Timer State
  const initialTime = (scenarioDurations[scenario] || 15) * 60 // seconds
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Metrics
  const [opponentMood, setOpponentMood] = useState("curious")
  const [opponentPatience, setOpponentPatience] = useState(80)
  const [leverage, setLeverage] = useState(50)
  const [turnNumber, setTurnNumber] = useState(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: "demo_user",
            scenario_type: scenario,
            difficulty: difficulty
          })
        })
        
        if (!res.ok) throw new Error("Failed to create session")
        
        const data = await res.json()
        setSessionId(data.session_id)
        setOpponentMood(data.opponent_mood)
        setOpponentPatience(data.opponent_patience)
        setLeverage(data.current_leverage)
        setTurnNumber(data.turn_number)
        
        setMessages([{ role: "assistant", content: "Hi! I understand you wanted to discuss your compensation. What brings this up now?" }])
        setInitializing(false)
      } catch (error) {
        console.error("Failed to initialize session:", error)
        setInitializing(false)
      }
    }

    initSession()
  }, [scenario, difficulty])

  // Timer Logic
  useEffect(() => {
    if (initializing) return

    if (!isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, timeLeft, initializing])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading || isPaused) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage })
      })

      if (!res.ok) throw new Error("Failed to send message")

      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.opponent_response }])
      setOpponentMood(data.opponent_mood)
      setOpponentPatience(data.opponent_patience)
      setLeverage(data.current_leverage)
      setTurnNumber(data.turn_number)
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setLoading(false)
    }
  }

  const endNegotiation = async () => {
    if (!sessionId) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/end`, {
        method: "POST"
      })

      if (!res.ok) throw new Error("Failed to end session")
      router.push(`/analysis/${sessionId}`)
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  const moodEmoji = {
    curious: "😊",
    neutral: "😐",
    defensive: "😠",
    hostile: "😡"
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4 relative">
             <div className="absolute inset-0 rounded-2xl border border-teal-500/30 animate-pulse" />
             <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          </div>
          <p className="text-white/60 text-lg font-light tracking-wide animate-pulse">Initializing Neural Environment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-teal-500/30 overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-[100%] blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-[100%] blur-[100px] translate-y-1/3" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 shrink-0 z-20">
          <Link href="/scenarios" className="flex items-center gap-2 text-white/50 hover:text-teal-400 transition-colors group px-3 py-2 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Exit Simulation</span>
          </Link>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400 animate-pulse' : 'bg-green-400 animate-pulse'}`} />
                <span className="text-xs font-mono text-white/60">{isPaused ? 'PAUSED' : 'LIVE'}</span>
             </div>
             <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4 text-teal-400" />
                <span className="font-mono text-lg font-bold tabular-nums tracking-wider">{formatTime(timeLeft)}</span>
             </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid lg:grid-cols-12 gap-6 pb-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-8 flex flex-col bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Top Bar */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white/90">Agent Alpha</h2>
                    <p className="text-xs text-white/40 capitalize">{scenario.replace("_", " ")} • {difficulty}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 pr-2">
                 <div className="text-right hidden sm:block">
                   <p className="text-[10px] uppercase tracking-widest text-white/30">Sentiment</p>
                   <p className="text-xs font-bold text-teal-400 capitalize">{opponentMood}</p>
                 </div>
                 <div className="text-3xl grayscale hover:grayscale-0 transition-all cursor-help" title={`Opponent Mood: ${opponentMood}`}>
                    {moodEmoji[opponentMood as keyof typeof moodEmoji]}
                 </div>
               </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-6 py-4 shadow-lg text-sm leading-relaxed relative ${
                      msg.role === "user" 
                        ? "bg-teal-600 text-white rounded-tr-sm" 
                        : "bg-white/5 border border-white/5 text-white/90 rounded-tl-sm backdrop-blur-md"
                    }`}>
                      {msg.content}
                      <span className="text-[10px] opacity-40 absolute bottom-1 right-3">
                         {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50 animate-bounce" />
                      </div>
                      <span className="text-xs text-white/30 font-mono">PROCESSING</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t border-white/5 bg-white/[0.02] backdrop-blur-md ${isPaused ? "opacity-50 pointer-events-none grayscale" : "opacity-100"}`}>
               <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
                 <button className="p-3 rounded-xl hover:bg-white/5 text-white/30 hover:text-white/70 transition-colors">
                    <Mic className="w-5 h-5" />
                 </button>
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                   placeholder={isPaused ? "Simulation Paused" : "Type your strategic response..."}
                   className="flex-1 bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-light"
                   disabled={loading || isPaused}
                   autoFocus
                 />
                 <button
                   onClick={sendMessage}
                   disabled={loading || !input.trim() || isPaused}
                   className="p-3 bg-teal-500 text-black rounded-xl hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20"
                 >
                   <Send className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>

          {/* Right Sidebar - Analytics */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-1">
             {/* Stat Cards */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/5 p-4 rounded-2xl relative overflow-hidden group hover:border-teal-500/30 transition-colors">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Target className="w-12 h-12" />
                   </div>
                   <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Leverage</p>
                   <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-white">{leverage}%</span>
                      {leverage > 50 && <TrendingUp className="w-4 h-4 text-green-400 mb-1" />}
                   </div>
                   <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${leverage}%` }}
                        className="h-full bg-teal-500" 
                      />
                   </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-4 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Zap className="w-12 h-12" />
                   </div>
                   <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Patience</p>
                   <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-white">{opponentPatience}%</span>
                   </div>
                   <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${opponentPatience}%` }}
                        className={`h-full ${opponentPatience < 50 ? 'bg-red-500' : 'bg-purple-500'}`}
                      />
                   </div>
                </div>
             </div>

             {/* Pattern Analysis */}
             <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 flex-1">
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                   <h3 className="text-sm font-bold tracking-wide">LIVE ANALYSIS</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-white/80 text-sm leading-relaxed">
                        {messages.length < 2 ? (
                          <span className="text-white/30 italic">Detailed tactical analysis will appear here after the first exchange...</span>
                        ) : leverage > 60 ? (
                           <>You have gained significant ground. <span className="text-teal-400">Press for specific terms within the next 2 turns.</span></>
                        ) : opponentPatience < 50 ? (
                           <>Warning: Opponent showing signs of fatigue. <span className="text-red-400">Switch to empathy tactical mode.</span></>
                        ) : (
                           <>Conversation functioning within normal parameters. Focus on discovering the opponent's BATNA.</>
                        )}
                      </p>
                   </div>
                </div>
             </div>

             {/* Controls */}
             <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={togglePause}
                  className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white text-white/70 transition-all flex items-center justify-center gap-2"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button 
                  onClick={endNegotiation}
                  className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 text-red-400 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Abort
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
