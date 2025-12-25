"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles, TrendingDown, DollarSign, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

const cancellationReasons = [
  { id: 1, icon: DollarSign, label: "Too expensive", value: "price" },
  { id: 2, icon: Users, label: "Not using it enough", value: "usage" },
  { id: 3, icon: TrendingDown, label: "Missing features", value: "features" },
  { id: 4, icon: Clock, label: "Need a break", value: "break" },
]

export function RetentionDashboard() {
  const [step, setStep] = useState<"reasons" | "offer">("reasons")
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const membershipId = "mem_TEST_12345"; 

  const handleReasonSelect = async (value: string) => {
    setSelectedReason(value)
    try {
      await addDoc(collection(db, "attempts"), {
        reason: value,
        date: serverTimestamp(),
        membershipId: membershipId
      });
    } catch (e) {
      console.error("Firebase Error:", e);
    }
    setTimeout(() => setStep("offer"), 300)
  }

  const handleClaimOffer = async () => {
    setLoading(true);
    // Logic for applying discount goes here
    setTimeout(() => {
      alert("Offer Applied! Returning to Whop.");
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-card px-4 py-2">
          <Sparkles className="mr-2 h-5 w-5 text-neon-pink" />
          <span className="text-sm font-medium text-foreground">Algofomo Retention</span>
        </div>
        <h1 className="text-4xl font-bold text-balance">
          <span className="text-neon-pink">Wait,</span> <span className="text-foreground">before you go...</span>
        </h1>
      </div>

      <div className="relative min-h-[400px]">
        {step === "reasons" && (
          <Card className="border-border/50 bg-card p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-semibold">What's making you cancel?</h2>
            <div className="space-y-3">
              {cancellationReasons.map((reason) => {
                const Icon = reason.icon
                return (
                  <button
                    key={reason.id}
                    onClick={() => handleReasonSelect(reason.value)}
                    className={cn(
                      "group relative w-full rounded-lg border-2 p-5 transition-all",
                      selectedReason === reason.value ? "border-neon-pink bg-neon-pink/10 neon-glow-pink" : "border-border bg-muted/30 hover:border-neon-cyan hover:bg-neon-cyan/5",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={cn("h-6 w-6", selectedReason === reason.value ? "text-neon-pink" : "text-muted-foreground")} />
                      <span className="text-lg font-medium">{reason.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        )}

        {step === "offer" && (
          <div className="relative glass-morphism rounded-2xl p-8 neon-glow-cyan bg-slate-900/50">
            <h2 className="mb-3 text-3xl font-bold">
              <span className="text-neon-cyan">50% OFF</span> <span>Next 3 Months</span>
            </h2>
            <div className="mb-8 rounded-xl border border-neon-cyan/30 bg-background/50 p-6">
              <div className="flex items-baseline justify-center gap-2 text-white">
                <span className="text-3xl line-through opacity-50">$99</span>
                <span className="text-5xl font-bold text-neon-cyan">$49</span>
              </div>
            </div>
            <Button onClick={handleClaimOffer} disabled={loading} className="w-full bg-neon-cyan text-black font-bold h-14 text-lg">
              {loading ? "Processing..." : "Claim This Offer"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}