"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { signIn, signOut, useSession } from "next-auth/react"
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Lock, 
  Server, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  BrainCircuit,
  Network,
  User,
  LogOut
} from "lucide-react"
import Image from "next/image"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utils
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function Home() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-teal-500/30 overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-teal-500 origin-left z-[100]"
        style={{ scaleX }}
      />

      <Navbar />
      <HeroSection />
      <ProcessSection />
      <ThreatsSection />
      <TimelineSection />
      <Footer />
    </div>
  )
}

// 1. Navbar
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b",
      scrolled ? "bg-black/50 backdrop-blur-md border-white/10 py-4" : "bg-transparent border-transparent py-6"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/logo.png" alt="Negotium" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight">NEGOTIUM</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
            {status === "authenticated" && (
              <>
                <Link href="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link>
                <Link href="/scenarios" className="hover:text-teal-400 transition-colors">Scenarios</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
             <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : status === "authenticated" ? (
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                 <div className="text-right hidden md:block">
                   <div className="text-sm font-bold text-white">{session.user?.name}</div>
                   <div className="text-xs text-white/40">{session.user?.email}</div>
                 </div>
                 {session.user?.image ? (
                   <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                     <Image src={session.user.image} alt="User" fill className="object-contain" />
                   </div>
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                      <User className="w-5 h-5" />
                    </div>
                 )}
               </div>
               <button 
                 onClick={() => signOut()}
                 className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
                 title="Sign Out"
               >
                 <LogOut className="w-5 h-5" />
               </button>
            </div>
          ) : (
            <>
              <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Log In
              </button>
              <button 
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-teal-50 transition-colors"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// 2. Hero Section
function HeroSection() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleStart = () => {
    if (session) {
      router.push("/dashboard")
    } else {
      signIn("google", { callbackUrl: "/dashboard" })
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="mb-12 relative flex justify-center"
        >
          <div className="w-24 h-24 rounded-2xl bg-black/50 border border-teal-500/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_-10px_rgba(20,184,166,0.3)]">
            <Cpu className="w-12 h-12 text-teal-400 animate-pulse" />
          </div>
          {/* Connecting lines decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[200px] bg-gradient-to-b from-transparent via-teal-500/50 to-transparent" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-8xl font-bold tracking-tight mb-6"
        >
          Negotiate with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-200 to-teal-500">
            Superhuman Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-white/50 max-w-2xl mx-auto mb-12"
        >
          The world's most advanced AI training platform. Verify your skills against adaptive neural networks modeled after top-tier strategists.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button 
            onClick={handleStart}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full font-semibold text-lg transition-all hover:scale-105"
          >
            <div className="absolute inset-0 border border-teal-500/50 rounded-full" />
            <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-md group-hover:bg-teal-500/20 transition-colors" />
            <span className="relative flex items-center gap-2 text-teal-400">
              Start Simulation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}



// 4. Process Transition Section
function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])

  return (
    <section ref={containerRef} className="py-32 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <motion.h2 
          className="text-4xl md:text-6xl font-bold mb-20"
          style={{ opacity, scale }}
        >
          Adaptive Intelligence <br />
          <span className="text-teal-500">Verifies Skills</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {[
            { icon: BrainCircuit, title: "Analyze", desc: "Real-time behavioral decomposition" },
            { icon: Network, title: "Simulate", desc: "Adversarial neural agents" },
            { icon: CheckCircle2, title: "Perfect", desc: "Actionable feedback loops" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
                <item.icon className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-white/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// 5. Threats/Reveal Section
function ThreatsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, 0])
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0])

  return (
    <section ref={containerRef} className="py-32 px-4">
      <motion.div 
        style={{ y, rotateX: rotate }}
        className="container mx-auto max-w-6xl rounded-3xl overflow-hidden bg-[#111] border border-white/10 shadow-2xl"
      >
        <div className="grid md:grid-cols-2">
          {/* Left Visual */}
          <div className="relative h-[400px] md:h-auto bg-gradient-to-br from-teal-900/40 to-black p-12 flex flex-col justify-between overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.2),transparent_60%)]" />
            
            {/* Animated Sphere Representation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              <div className="w-full h-full rounded-full border border-teal-500/30 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-teal-500/20 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-8 rounded-full bg-teal-500/10 blur-xl animate-pulse" />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-2">Common Pitfalls</h3>
              <p className="text-teal-400 font-mono text-sm">DETECTED IN 90% OF DEALS</p>
            </div>
          </div>

          {/* Right Content */}
          <div className="p-12 bg-white text-black">
            <h3 className="text-3xl font-bold mb-8">
              New deals equal <br />
              <span className="text-teal-600">New Threats.</span>
            </h3>

            <div className="grid gap-6">
              {[
                { title: "Leaving Money on the Table", desc: "Failure to anchor correctly in opening rounds." },
                { title: "Emotional Compromise", desc: "Losing leverage due to frustration signals." },
                { title: "Information Asymmetry", desc: "Revealing BATNA too early in the cycle." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group cursor-default">
                  <div className="mt-1 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <AlertTriangle className="w-3 h-3 text-teal-700 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-black/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// 6. Timeline / Scroll Spy Section
function TimelineSection() {
  return (
    <section className="py-32 container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="lg:sticky lg:top-32 h-fit">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Mastering Every <br />
            <span className="text-teal-500">Stage of the Deal.</span>
          </h2>
          <p className="text-xl text-white/50 max-w-md">
            Our neural engine guides you through the complete lifecycle of a high-stakes negotiation.
          </p>
        </div>

        <div className="relative space-y-24 pl-8 border-l border-white/10">
          {[
            {
              step: "01",
              title: "Preparation & Simulation",
              desc: "Run limitless scenarios against an AI that knows your industry's specific constraints and variables."
            },
            {
              step: "02",
              title: "Real-time Advisory",
              desc: "The Shadow Coach analyzes leverage shifts in real-time, providing tactical whispers to pivot your strategy."
            },
            {
              step: "03",
              title: "Post-Game Analysis",
              desc: "Deep behavioral decomposition. Understand exactly where you won trust and where you lost value."
            }
          ].map((item, i) => (
            <StepItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepItem({ item, index }: { item: any, index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" })

  return (
    <div ref={ref} className="relative">
      <div className={cn(
        "absolute -left-[39px] top-0 w-5 h-5 rounded-full border-4 border-[#0a0a0a] transition-colors duration-500",
        isInView ? "bg-teal-500" : "bg-white/10"
      )} />
      
      <span className={cn(
        "text-sm font-mono mb-2 block transition-colors duration-500",
        isInView ? "text-teal-500" : "text-white/30"
      )}>
        PHASE {item.step}
      </span>
      
      <h3 className={cn(
        "text-3xl font-bold mb-4 transition-colors duration-500",
        isInView ? "text-white" : "text-white/30"
      )}>
        {item.title}
      </h3>
      
      <p className={cn(
        "text-lg transition-colors duration-500",
        isInView ? "text-white/70" : "text-white/20"
      )}>
        {item.desc}
      </p>
    </div>
  )
}

// Footer
function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 bg-black/50">
      <div className="container mx-auto px-6 flex flex-col items-center">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden mb-8">
          <Image src="/logo.png" alt="Negotium" fill className="object-cover" />
        </div>
        <div className="flex gap-8 mb-8 text-sm text-white/50">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
        </div>
        <p className="text-white/20 text-xs">© 2026 Negotium AI Inc. All rights reserved.</p>
      </div>
    </footer>
  )
}
