"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle, Loader2, Target } from "lucide-react"

type Analysis = {
  summary: string
  outcome: string
  strengths: Array<{ point: string; explanation: string }>
  mistakes: Array<{ point: string; explanation: string }>
  skill_gaps: string[]
  leverage_trajectory: number[]
  mood_trajectory: string[]
}

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/analysis`)
        
        if (!res.ok) throw new Error("Failed to fetch analysis")
        
        const data = await res.json()
        setAnalysis(data)
      } catch (err) {
        setError("Failed to load analysis. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchAnalysis()
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-gray-400">Analyzing your negotiation...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">{error || "Analysis not available"}</p>
          <Link href="/dashboard" className="text-violet-400 hover:text-violet-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const outcomeColors = {
    success: "text-green-400 bg-green-400/10 border-green-400/30",
    partial_success: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    failure: "text-red-400 bg-red-400/10 border-red-400/30"
  }

  const outcomeLabels = {
    success: "Success",
    partial_success: "Partial Success",
    failure: "Needs Work"
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
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
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

      <main className="relative z-10 container mx-auto px-6 py-32 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
            <TrendingUp className="w-3 h-3" />
            PERFORMANCE ANALYSIS
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Session Report</h1>
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border ${outcomeColors[analysis.outcome.toLowerCase().replace(' ', '_') as keyof typeof outcomeColors] || outcomeColors.partial_success} text-xl font-semibold`}>
            {analysis.outcome.toLowerCase().includes('success') && <CheckCircle className="w-6 h-6" />}
            {analysis.outcome}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
          <p className="text-white/70 leading-relaxed text-lg">{analysis.summary}</p>
        </div>

        {/* Leverage Chart - Line Graph with Area Fill */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-400" />
            Leverage Progression
          </h2>
          <p className="text-white/40 text-sm mb-6">Your negotiation power throughout the conversation</p>
          
          <div className="relative h-64">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 font-mono">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              <div className="absolute w-full border-t border-white/5 top-0"></div>
              <div className="absolute w-full border-t border-white/5 top-1/4"></div>
              <div className="absolute w-full border-t border-white/10 top-1/2"></div>
              <div className="absolute w-full border-t border-white/5 top-3/4"></div>
              <div className="absolute w-full border-t border-white/5 bottom-0"></div>
            </div>

            {/* Line chart with area */}
            <svg className="absolute left-12 right-0 top-0 bottom-0 w-[calc(100%-3rem)] h-full" viewBox="0 0 800 256" preserveAspectRatio="none">
              <defs>
                <linearGradient id="leverageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Area fill */}
              <path
                d={`
                  M 0,${256 - (analysis.leverage_trajectory[0] * 2.56)}
                  ${analysis.leverage_trajectory.map((score, idx) => {
                    const x = (idx / (analysis.leverage_trajectory.length - 1)) * 800;
                    const y = 256 - (score * 2.56);
                    return `L ${x},${y}`;
                  }).join(' ')}
                  L 800,256
                  L 0,256
                  Z
                `}
                fill="url(#leverageGradient)"
              />
              
              {/* Line connecting dots */}
              <path
                d={`
                  M 0,${256 - (analysis.leverage_trajectory[0] * 2.56)}
                  ${analysis.leverage_trajectory.map((score, idx) => {
                    const x = (idx / (analysis.leverage_trajectory.length - 1)) * 800;
                    const y = 256 - (score * 2.56);
                    return `L ${x},${y}`;
                  }).join(' ')}
                `}
                fill="none"
                stroke="rgb(139, 92, 246)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Data points */}
              {analysis.leverage_trajectory.map((score, idx) => {
                const x = (idx / (analysis.leverage_trajectory.length - 1)) * 800;
                const y = 256 - (score * 2.56);
                return (
                  <g key={idx}>
                    {/* Outer glow */}
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill="rgb(139, 92, 246)"
                      opacity="0.3"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Main dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r="7"
                      fill="rgb(139, 92, 246)"
                      stroke="rgb(30, 30, 50)"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Hover area */}
                    <circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill="transparent"
                      className="hover:fill-violet-500/20 transition-all cursor-pointer"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Tooltip on hover */}
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      className="text-xs fill-violet-400 font-mono font-bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      {score}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between mt-4 text-xs text-gray-500 px-12 font-mono">
            <span>Turn 1</span>
            <span>Turn {Math.ceil(analysis.leverage_trajectory.length / 2)}</span>
            <span>Turn {analysis.leverage_trajectory.length}</span>
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-teal-400" />
            What You Did Well
          </h2>
          <div className="space-y-4">
            {analysis.strengths && analysis.strengths.length > 0 ? (
              analysis.strengths.map((strength, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-5 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all">
                  <p className="font-semibold mb-2 text-white">{strength.point}</p>
                  <p className="text-sm text-white/60">{strength.explanation}</p>
                </div>
              ))
            ) : (
              <div className="bg-white/5 rounded-lg p-4 text-center text-white/40">
                Analysis in progress...
              </div>
            )}
          </div>
        </div>

        {/* Mistakes */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-400" />
            Areas for Improvement
          </h2>
          <div className="space-y-4">
            {analysis.mistakes && analysis.mistakes.length > 0 ? (
              analysis.mistakes.map((mistake, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-5 hover:bg-white/[0.07] hover:border-amber-500/30 transition-all">
                  <p className="font-semibold mb-2 text-white">{mistake.point}</p>
                  <p className="text-sm text-white/60">{mistake.explanation}</p>
                </div>
              ))
            ) : (
              <div className="bg-white/5 rounded-lg p-4 text-center text-white/40">
                Analysis in progress...
              </div>
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="bg-gradient-to-br from-teal-900/20 to-black border border-teal-500/20 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-teal-400" />
            Recommended Learning Paths
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Master these skills to level up your negotiation game. Click to access curated resources.
          </p>
          <div className="grid gap-4">
            {analysis.skill_gaps && analysis.skill_gaps.length > 0 ? (
              analysis.skill_gaps.map((skill, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between group hover:bg-white/[0.07] hover:border-teal-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                    <span className="text-teal-400 font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-teal-400 transition-colors">{skill}</p>
                    <p className="text-xs text-white/40 mt-0.5">Unlock advanced tactics and frameworks</p>
                  </div>
                </div>
                <Link
                  href={`/learn/${encodeURIComponent(skill)}`}
                  className="px-5 py-2.5 bg-teal-500 text-black font-bold rounded-lg hover:bg-teal-400 transition-all text-sm"
                >
                  Learn
                </Link>
              </div>
              ))
            ) : (
              <div className="bg-white/5 rounded-lg p-4 text-center text-white/40">
                Analysis in progress...
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/scenarios"
            className="flex-1 px-6 py-4 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 transition-all duration-300 text-center"
          >
            Practice Again
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300 text-center"
          >
            View Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
