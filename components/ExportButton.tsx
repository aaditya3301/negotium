"use client"

import { FileText } from "lucide-react"

export default function ExportButton() {
  const handleExport = () => {
    window.print()
  }

  return (
    <button 
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-all duration-200 text-sm font-medium text-teal-400"
    >
      <FileText className="w-4 h-4" />
      Export Report
    </button>
  )
}
