"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  DollarSign, 
  Settings, 
  Save, 
  Users, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc, getDoc, query, orderBy, limit } from "firebase/firestore"

// Types for our data
interface Attempt {
  id: string
  reason: string
  date: any
  membershipId: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [discountPercent, setDiscountPercent] = useState("30")
  const [stats, setStats] = useState({ saved: 0, revenue: 0, churned: 0 })
  const [recentLogs, setRecentLogs] = useState<Attempt[]>([])

  // Load Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Config
        const configSnap = await getDoc(doc(db, "config", "settings"))
        if (configSnap.exists()) {
          setDiscountPercent(configSnap.data().discountPercent || "30")
        }

        // 2. Get Logs (Last 20 attempts)
        const q = query(collection(db, "attempts"), orderBy("date", "desc"), limit(20))
        const querySnapshot = await getDocs(q)
        
        const logs: Attempt[] = []
        let savedCount = 0
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          logs.push({ id: doc.id, ...data } as Attempt)
          // Simple logic: If they saw the offer, we count it as a "Save Attempt"
          savedCount++ 
        })
        
        setRecentLogs(logs)
        setStats({
          saved: savedCount,
          revenue: savedCount * 99, // Assuming $99/mo value
          churned: 0 // Placeholder until we track final cancellations
        })

      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      await setDoc(doc(db, "config", "settings"), {
        discountPercent: discountPercent,
        updatedAt: new Date()
      }, { merge: true })
      alert("System Updated: New Discount is Live")
    } catch (e) {
      alert("Error saving settings")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black p-6 md:p-12 font-sans text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-neon-cyan">Command</span> Center
            </h1>
            <p className="text-muted-foreground">Real-time retention monitoring</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-neon-pink/20 bg-neon-pink/10 px-4 py-1">
            <Activity className="h-4 w-4 text-neon-pink animate-pulse" />
            <span className="text-sm font-medium text-neon-pink">System Active</span>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-neon-cyan/20 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-neon-cyan/10 p-3">
                <DollarSign className="h-6 w-6 text-neon-cyan" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue Protected</p>
                <h3 className="text-2xl font-bold text-white">${stats.revenue}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="border-neon-pink/20 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-neon-pink/10 p-3">
                <Users className="h-6 w-6 text-neon-pink" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Churn Attempts</p>
                <h3 className="text-2xl font-bold text-white">{stats.saved}</h3>
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Save Rate</p>
                <h3 className="text-2xl font-bold text-white">Calculating...</h3>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          
          {/* CONFIGURATION PANEL */}
          <Card className="border-border/50 bg-slate-900/80 p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-400" />
              <h2 className="text-xl font-semibold">Offer Configuration</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Discount Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full rounded-lg border border-border bg-black/50 p-4 text-2xl font-bold text-neon-cyan focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                  />
                  <span className="absolute right-4 top-4 text-gray-500">% OFF</span>
                </div>
                <p className="text-xs text-gray-500">
                  This offer appears when users select "Too Expensive".
                </p>
              </div>

              <Button 
                onClick={handleSaveConfig} 
                disabled={loading}
                className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/90 font-bold"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Update Live Offer"}
              </Button>
            </div>
          </Card>

          {/* LIVE LOGS */}
          <Card className="border-border/50 bg-slate-900/80 p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" />
              <h2 className="text-xl font-semibold">Live Activity Feed</h2>
            </div>

            <div className="h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-black/30 p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <div>
                      <p className="font-medium text-white">{log.reason}</p>
                      <p className="text-xs text-gray-500">Member: {log.membershipId.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {log.date ? new Date(log.date.seconds * 1000).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              ))}
              
              {recentLogs.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}