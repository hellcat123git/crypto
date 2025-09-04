import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get("input")

  if (!input) {
    return NextResponse.json({ error: "Input parameter is required" }, { status: 400 })
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&components=country:in`,
    )

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Places API error:", error)
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 })
  }
}
