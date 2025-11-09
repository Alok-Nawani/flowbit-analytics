import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const VANNA_URL = process.env.VANNA_API_BASE_URL;
    if (!VANNA_URL) {
      return NextResponse.json({ error: "Vanna service not configured" }, { status: 500 });
    }

    const response = await fetch(`${VANNA_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.VANNA_API_KEY && {
          Authorization: `Bearer ${process.env.VANNA_API_KEY}`,
        }),
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Vanna service error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in chat-with-data:", error);
    
    // Check if it's a connection error
    if (error instanceof Error && (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed"))) {
      return NextResponse.json(
        { 
          error: "Vanna AI service is not running. Please start it with: cd services/vanna && uvicorn app:app --reload --port 8000" 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process query" },
      { status: 500 }
    );
  }
}

