import { NextRequest, NextResponse } from "next/server";
import { generateResume } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }
    const jsonText = await generateResume(input);
    return NextResponse.json({ result: jsonText });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
