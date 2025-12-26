import { Suspense } from 'react'
import { RetentionDashboard } from "@/components/retention-dash"

export default function Page() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <RetentionDashboard />
      </Suspense>
    </main>
  )
}