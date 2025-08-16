import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "trash-collection-api",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
