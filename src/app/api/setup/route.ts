import { NextResponse } from "next/server";
import { initializeSheets } from "@/lib/google-sheets";

export async function GET() {
  try {
    if (!process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_ID === "your_google_sheet_id_here") {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_ID is not configured in .env.local" },
        { status: 400 }
      );
    }
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.includes("your-service-account")) {
      return NextResponse.json(
        { error: "GOOGLE_SERVICE_ACCOUNT_EMAIL is not configured in .env.local" },
        { status: 400 }
      );
    }

    await initializeSheets();
    return NextResponse.json({
      success: true,
      message: "Google Sheets tabs initialized successfully! (categories, items, item_variants, stock_logs, events, users)",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initialize sheets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

