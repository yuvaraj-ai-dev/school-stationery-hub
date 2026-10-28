import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getItemVariants, createVariant, updateVariant, deleteVariant,
  updateVariantStock, createStockLog, getVariantsByItem,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const itemId = req.nextUrl.searchParams.get("item_id");
  const variants = itemId ? await getVariantsByItem(itemId) : await getItemVariants();
  return NextResponse.json(variants);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const variant = await createVariant(data);
  return NextResponse.json(variant);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await req.json();
  await updateVariant(id, data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  await deleteVariant(id);
  return NextResponse.json({ success: true });
}
