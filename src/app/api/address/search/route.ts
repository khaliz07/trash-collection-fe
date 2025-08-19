import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = searchParams.get("limit") || "5";

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    // Forward request to Nominatim API
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&countrycodes=vn&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "TrashCollectionApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      { error: "Failed to search addresses" },
      { status: 500 }
    );
  }
}
