import { NextResponse } from "next/server"

// This is your backend "Handshake" with Whop
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { membershipId, discountPercent } = body

    // 1. SECURITY CHECK
    const WHOP_API_KEY = process.env.WHOP_API_KEY
    
    if (!WHOP_API_KEY) {
      console.error("CRITICAL: WHOP_API_KEY is missing in Environment Variables.")
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
    }

    if (!membershipId || membershipId.startsWith("mem_TEST")) {
      // Allow simulation for testing, but don't call real API
      console.log(`[SIMULATION] Applying ${discountPercent}% save to ${membershipId}`)
      return NextResponse.json({ success: true, mode: "simulation" })
    }

    // 2. CALCULATE REWARD (Logic: 30% Off roughly equals ~10 Free Days on a monthly plan)
    // We use "Add Free Days" because it's the smoothest "Save" action 
    // that doesn't require the user to re-enter a credit card.
    const freeDaysMap: Record<string, number> = {
        "30": 10, // 30% off ~ 10 days free
        "50": 15, // 50% off ~ 15 days free
        "100": 30 // 100% off ~ 30 days free
    }
    const daysToAdd = freeDaysMap[discountPercent] || 7

    // 3. CALL WHOP API
    const response = await fetch(`https://api.whop.com/api/v2/memberships/${membershipId}/add_free_days`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHOP_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ days: daysToAdd })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Whop API Error:", errorData)
      throw new Error("Failed to apply discount with Whop")
    }

    // 4. SUCCESS
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Internal Server Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}