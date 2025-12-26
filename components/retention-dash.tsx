"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles, TrendingDown, DollarSign, Clock, Users, CheckCircle, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"

const cancellationReasons = [
  { id: 1, icon: DollarSign, label: "Too expensive", value: "price" },
  { id: 2, icon: Users, label: "Not using it enough", value: "usage" },
  { id: 3, icon: TrendingDown, label: "Missing features", value: "features" },
  { id: 4, icon: Clock, label: "Need a break", value: "break" },
]

export function RetentionDashboard() {
  const searchParams = useSearchParams()
  // 1. DYNAMIC ID: Grab from URL or fall back to test ID
  const membershipId = searchParams.get("membership_id") || "mem_TEST_12345"
  
  const [step, setStep] = useState<"reasons" | "offer" | "success">("reasons")
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // 2. LIVE CONFIG STATE
  const [discountPercent, setDiscountPercent] = useState("30") // Default to 30%

  // Fetch the Admin Config on load
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, "config", "settings"))
        if (docSnap.exists()) {
          setDiscountPercent(docSnap.data().discountPercent || "30")
        }
      } catch (e) {
        console.error("Failed to load discount config", e)
      }
    }
    fetchConfig()
  }, [])

  const handleReasonSelect = async (value: string) => {
    setSelectedReason(value)
    
    // Log the attempt to Firebase (Feeds the Admin Live Logs)
    try {
      await addDoc(collection(db, "attempts"), {
        reason: value,
        date: serverTimestamp(),
        membershipId: membershipId,
        status: "viewed_offer"
      });
    } catch (e) {
      console.error("Firebase Error:", e);
    }
    
    // Small delay for UI smoothness
    setTimeout(() => setStep("offer"), 300)
  }

  const handleClaimOffer = async () => {
    setLoading(true);
    
    // TODO: In Phase 3, we will call the API route here to ping Whop
    // await fetch('/api/claim-offer', { method: 'POST', body: JSON.stringify({ membershipId }) })

    // Simulate API delay
    setTimeout(async () => {
      // Log the success "Save"
      try {
        await addDoc(collection(db, "saves"), {
          membershipId: membershipId,
          discountApplied: discountPercent,
          date: serverTimestamp()
        });
      } catch (e) {}
      
      setLoading(false);
      setStep("success"); // 3. SHOW SUCCESS UI
    }, 1500);
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      {/* HEADER LOGO */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-card/50 px-4 py-2 border border-white/5 backdrop-blur-md">
          <Sparkles className="mr-2 h-5 w-5 text-neon-pink animate-pulse" />
          <span className="text-sm font-medium text-foreground">Algofomo Retention</span>
        </div>
        
        {step !== "success" && (
          <h1 className="text-4xl font-bold text-balance">
            <span className="text-neon-pink">Wait,</span> <span className="text-foreground">before you go...</span>
          </h1>
        )}
      </div>

      <div className="relative min-h-[400px]">
        
        {/* STEP 1: REASONS */}
        {step === "reasons" && (
          <Card className="border-border/50 bg-card p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="mb-6 text-2xl font-semibold">What's making you cancel?</h2>
            <div className="space-y-3">
              {cancellationReasons.map((reason) => {
                const Icon = reason.icon
                return (
                  <button
                    key={reason.id}
                    onClick={() => handleReasonSelect(reason.value)}
                    className={cn(
                      "group relative w-full rounded-lg border-2 p-5 transition-all duration-300",
                      selectedReason === reason.value 
                        ? "border-neon-pink bg-neon-pink/10 shadow-[0_0_15px_rgba(255,0,128,0.3)]" 
                        : "border-white/5 bg-black/20 hover:border-neon-cyan/50 hover:bg-neon-cyan/5",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={cn("h-6 w-6 transition-colors", selectedReason === reason.value ? "text-neon-pink" : "text-muted-foreground group-hover:text-neon-cyan")} />
                      <span className="text-lg font-medium">{reason.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        )}

        {/* STEP 2: THE GOLDEN TICKET */}
        {step === "offer" && (
          <div className="relative overflow-hidden rounded-2xl border border-neon-cyan/30 bg-slate-900/80 p-8 shadow-[0_0_40px_rgba(0,255,255,0.1)] backdrop-blur-xl">
            {/* Background Glow Effect */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-neon-cyan/10 blur-3xl pointer-events-none" />
            
            <h2 className="mb-3 text-3xl font-bold relative z-10">
              <span className="text-neon-cyan drop-shadow-md">{discountPercent}% OFF</span> <span>Next 3 Months</span>
            </h2>
            <p className="text-muted-foreground mb-8 relative z-10">
              We'd hate to see you lose access to the alpha. Stay with us for a special rate.
            </p>

            <div className="mb-8 rounded-xl border border-neon-cyan/30 bg-black/40 p-6 relative z-10">
              <div className="flex items-baseline justify-center gap-4 text-white">
                <span className="text-2xl text-gray-500 line-through">$99</span>
                <span className="text-5xl font-bold text-white shadow-black drop-shadow-lg">
                   ${(99 * (1 - parseInt(discountPercent)/100)).toFixed(0)}
                </span>
                <span className="text-sm font-medium text-neon-cyan bg-neon-cyan/10 px-2 py-1 rounded">
                  SAVE ${ (99 * (parseInt(discountPercent)/100)).toFixed(0) }
                </span>
              </div>
            </div>

            <Button 
              onClick={handleClaimOffer} 
              disabled={loading} 
              className="w-full bg-neon-cyan text-black font-bold h-14 text-lg hover:bg-neon-cyan/90 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              {loading ? "Applying Discount..." : "Claim This Offer"}
            </Button>
            
            <button 
              onClick={() => alert("Redirect to cancellation...")}
              className="mt-4 w-full text-sm text-gray-500 hover:text-white transition-colors"
            >
              No thanks, I still want to cancel
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === "success" && (
          <div className="relative text-center rounded-2xl border border-green-500/30 bg-slate-900/80 p-10 shadow-[0_0_40px_rgba(34,197,94,0.1)] backdrop-blur-xl animate-in fade-in zoom-in duration-500">
             <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Heart className="h-10 w-10 text-green-400 fill-green-400/20" />
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-4">
               Welcome back to the family!
             </h2>
             <p className="text-gray-400 mb-8 text-lg">
               Your <span className="text-green-400 font-bold">{discountPercent}% discount</span> has been applied successfully. Your access remains uninterrupted.
             </p>

             <Button 
               onClick={() => window.location.href = "https://whop.com/orders"} 
               className="bg-white text-black font-bold hover:bg-gray-200 w-full h-12"
             >
               Return to Dashboard
             </Button>
          </div>
        )}

      </div>
    </div>
  )
}