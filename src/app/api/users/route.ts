import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUsers, updateUserRole } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { email, role } = await req.json();
  await updateUserRole(email, role);
  return NextResponse.json({ success: true });
}
