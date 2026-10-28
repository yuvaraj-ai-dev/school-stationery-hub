import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStockLogs } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await getStockLogs();
  const userEmail = session.user.email;

  // Teachers only see their own logs
  if (session.user.role !== "admin") {
    return NextResponse.json(logs.filter((l) => l.used_by_email === userEmail));
  }
  return NextResponse.json(logs);
}
