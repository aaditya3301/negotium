"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

type Analysis = {
  overall_outcome: string
  executive_summary: string
  strengths: Array<{ point: string; turn: number; example: string }>
  mistakes: Array<{ point: string; turn: number; impact: string; example: string }>
  pivotal_moments: Array<{ turn: number; what_happened: string; analysis: string; better_approach: string }>
  patterns_identified: string[]
  focus_areas: string[]
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/logo.png" alt="Negotium" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight">NEGOTIUM</span>
          </Link>
        </div>

        {/* Outcome Badge */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Performance Analysis</h1>
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border ${outcomeColors[analysis.overall_outcome as keyof typeof outcomeColors]} text-xl font-semibold`}>
            {analysis.overall_outcome === "success" && <CheckCircle className="w-6 h-6" />}
            {outcomeLabels[analysis.overall_outcome as keyof typeof outcomeLabels]}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
          <p className="text-gray-300 leading-relaxed text-lg">{analysis.executive_summary}</p>
        </div>

        {/* Strengths */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            What You Did Well
          </h2>
          <div className="space-y-4">
            {analysis.strengths.map((strength, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold text-sm mt-1">Turn {strength.turn}</span>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{strength.point}</p>
                    <p className="text-sm text-gray-400 italic">"{strength.example}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mistakes */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            Critical Mistakes
          </h2>
          <div className="space-y-4">
            {analysis.mistakes.map((mistake, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 font-bold text-sm mt-1">Turn {mistake.turn}</span>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{mistake.point}</p>
                    <p className="text-sm text-gray-400 mb-2">Impact: {mistake.impact}</p>
                    <p className="text-sm text-gray-400 italic">"{mistake.example}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pivotal Moments */}
        {analysis.pivotal_moments.length > 0 && (
          <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-violet-400" />
              Pivotal Moments
            </h2>
            <div className="space-y-6">
              {analysis.pivotal_moments.map((moment, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-violet-400 font-bold">Turn {moment.turn}</span>
                    <div className="flex-1">
                      <p className="font-semibold mb-2">What Happened</p>
                      <p className="text-gray-300 mb-4">{moment.what_happened}</p>
                      
                      <p className="font-semibold mb-2">Analysis</p>
                      <p className="text-gray-300 mb-4">{moment.analysis}</p>
                      
                      <p className="font-semibold mb-2 text-green-400">Better Approach</p>
                      <p className="text-gray-300">{moment.better_approach}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns Identified */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Behavioral Patterns</h2>
          <ul className="space-y-3">
            {analysis.patterns_identified.map((pattern, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-violet-400 mt-1">•</span>
                <span className="text-gray-300">{pattern}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Focus Areas */}
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Focus Areas for Next Time</h2>
          <ul className="space-y-3">
            {analysis.focus_areas.map((area, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                <span className="text-gray-300 font-medium">{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Leverage Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Leverage Over Time</h2>
          <div className="h-64 flex items-end justify-between gap-1 px-4">
            {analysis.leverage_trajectory.map((score, idx) => (
              <div
                key={idx}
                className="w-full bg-gradient-to-t from-violet-500/30 to-indigo-500/50 rounded-t hover:from-violet-500/60 hover:to-indigo-500/80 transition-colors relative group"
                style={{ height: `${score}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-xs px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                  Turn {idx + 1}: {score}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500 px-4">
            <span>Start</span>
            <span>Mid-Game</span>
            <span>End</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/scenarios"
            className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300"
          >
            Practice Again
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-lg font-semibold text-center hover:bg-white/20 transition-all duration-300"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
