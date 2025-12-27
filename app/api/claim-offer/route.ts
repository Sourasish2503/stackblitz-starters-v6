import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { membershipId, discountPercent } = body

    // 1. SIMULATION CHECK (Moved to the Top)
    // We check this FIRST so you can test the UI even if your API Key is broken
    if (!membershipId || membershipId.startsWith("mem_TEST")) {
      console.log(`[SIMULATION] Applying ${discountPercent}% save to ${membershipId}`)
      // Simulate a 1-second delay so it feels real
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ success: true, mode: "simulation" })
    }

    // 2. SECURITY CHECK (Only runs for REAL users)
    const WHOP_API_KEY = process.env.WHOP_API_KEY
    
    if (!WHOP_API_KEY) {
      console.error("CRITICAL: WHOP_API_KEY is missing")
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
    }

    // 3. CALCULATE REWARD
    const freeDaysMap: Record<string, number> = {
        "30": 10, 
        "50": 15, 
        "100": 30 
    }
    const daysToAdd = freeDaysMap[discountPercent] || 7

    // 4. CALL WHOP API
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

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Internal Server Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}