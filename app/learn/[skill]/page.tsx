"use client"

import { use } from "react"
import { ArrowLeft, BookOpen, Video, FileText, Clock, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

type LearningResource = {
  id: string
  title: string
  type: "course" | "video" | "article"
  duration: string
  description: string
  url?: string
}

// Skill-specific learning resources
const learningResources: Record<string, LearningResource[]> = {
  "Anchoring": [
    {
      id: "1",
      title: "The Psychology of Anchoring in Negotiation",
      type: "video",
      duration: "12 min",
      description: "Learn how to set powerful anchors that shape the entire negotiation range."
    },
    {
      id: "2",
      title: "Advanced Anchoring Techniques",
      type: "course",
      duration: "45 min",
      description: "Master the art of first offers, extreme anchors, and re-anchoring strategies."
    },
    {
      id: "3",
      title: "When NOT to Anchor First",
      type: "article",
      duration: "8 min",
      description: "Understanding information asymmetry and strategic silence in negotiations."
    }
  ],
  "Active Listening": [
    {
      id: "4",
      title: "The 5 Levels of Listening",
      type: "video",
      duration: "15 min",
      description: "Develop deep listening skills to uncover hidden interests and build rapport."
    },
    {
      id: "5",
      title: "Mirroring & Labeling Practice",
      type: "course",
      duration: "30 min",
      description: "Interactive exercises to master FBI negotiation tactics."
    },
    {
      id: "6",
      title: "Body Language Reading Guide",
      type: "article",
      duration: "10 min",
      description: "Non-verbal cues that reveal true intentions and emotions."
    }
  ],
  "BATNA Development": [
    {
      id: "7",
      title: "Building Your Best Alternative",
      type: "video",
      duration: "18 min",
      description: "How to develop and strengthen your BATNA before entering negotiations."
    },
    {
      id: "8",
      title: "BATNA vs WATNA Analysis",
      type: "course",
      duration: "1 hour",
      description: "Complete framework for assessing alternatives and walk-away points."
    },
    {
      id: "9",
      title: "Case Study: Tesla's BATNA Strategy",
      type: "article",
      duration: "12 min",
      description: "Real-world example of leveraging alternatives in high-stakes deals."
    }
  ],
  "Emotional Control": [
    {
      id: "10",
      title: "Managing High-Pressure Moments",
      type: "video",
      duration: "14 min",
      description: "Techniques to stay calm and strategic under emotional stress."
    },
    {
      id: "11",
      title: "Tactical Empathy Workshop",
      type: "course",
      duration: "40 min",
      description: "Use emotions strategically without being controlled by them."
    },
    {
      id: "12",
      title: "The Pause Technique",
      type: "article",
      duration: "6 min",
      description: "How strategic silence creates negotiation power."
    }
  ],
  "Value Creation": [
    {
      id: "13",
      title: "Expanding the Pie",
      type: "video",
      duration: "16 min",
      description: "Move beyond zero-sum thinking to create win-win outcomes."
    },
    {
      id: "14",
      title: "Interest-Based Negotiation",
      type: "course",
      duration: "50 min",
      description: "Harvard's proven framework for collaborative problem-solving."
    },
    {
      id: "15",
      title: "Trade-off Matrix Template",
      type: "article",
      duration: "7 min",
      description: "Tool for identifying multiple variables and creative solutions."
    }
  ]
}

// Default resources for unknown skills
const defaultResources: LearningResource[] = [
  {
    id: "default-1",
    title: "Negotiation Fundamentals",
    type: "course",
    duration: "1 hour",
    description: "Core principles and strategies for effective negotiation."
  },
  {
    id: "default-2",
    title: "Common Negotiation Mistakes",
    type: "video",
    duration: "20 min",
    description: "Learn from the most frequent errors negotiators make."
  },
  {
    id: "default-3",
    title: "Building Confidence in Negotiations",
    type: "article",
    duration: "10 min",
    description: "Practical tips for approaching difficult conversations."
  }
]

type Props = {
  params: Promise<{ skill: string }>
}

export default function LearnSkillPage({ params }: Props) {
  const { skill } = use(params)
  const decodedSkill = decodeURIComponent(skill)
  const resources = learningResources[decodedSkill] || defaultResources

  const getIcon = (type: string) => {
    switch (type) {
      case "course": return BookOpen
      case "video": return Video
      case "article": return FileText
      default: return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "course": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "video": return "bg-teal-500/10 text-teal-400 border-teal-500/20"
      case "article": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-teal-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[600px] bg-teal-500/5 rounded-[100%] blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-500/5 rounded-[100%] blur-[120px] translate-y-1/3" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 relative">
                <Image src="/logo.png" alt="Negotium" fill className="object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white/90">NEGOTIUM</span>
            </Link>
            
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            SKILL DEVELOPMENT
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Master {decodedSkill}
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Curated learning resources to level up your negotiation skills
          </p>
        </motion.div>

        {/* Learning Path */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-purple-500 rounded-full" />
            <h2 className="text-xl font-semibold">Recommended Learning Path</h2>
          </div>

          {resources.map((resource, index) => {
            const Icon = getIcon(resource.type)
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="p-6 rounded-3xl bg-[#111] border border-white/5 hover:bg-white/[0.07] hover:border-teal-500/20 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                      <Icon className="w-6 h-6 text-teal-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold group-hover:text-teal-400 transition-colors">
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-white/40 font-mono">
                          <Clock className="w-4 h-4" />
                          <span>{resource.duration}</span>
                        </div>
                      </div>
                      
                      <p className="text-white/60 text-sm mb-3 leading-relaxed">
                        {resource.description}
                      </p>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getTypeColor(resource.type)}`}>
                          {resource.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-white/30 font-mono">
                          {index + 1}/{resources.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < resources.length - 1 && (
                  <div className="absolute left-[38px] top-[100px] w-0.5 h-4 bg-gradient-to-b from-teal-500/20 to-transparent" />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-teal-900/20 to-black border border-teal-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mb-2">Ready to practice?</h3>
              <p className="text-sm text-white/60">Apply what you've learned in a real negotiation simulation</p>
            </div>
            <Link
              href="/scenarios"
              className="px-6 py-3 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 transition-all flex items-center gap-2"
            >
              Start Training
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
