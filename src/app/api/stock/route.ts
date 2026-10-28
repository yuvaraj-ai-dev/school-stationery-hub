import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateVariantStock, createStockLog, getItemVariants } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { variant_id, action_type, quantity, event, notes, item_name, item_id, variant_label } = await req.json();

  // Get current stock
  const variants = await getItemVariants();
  const variant = variants.find((v) => v.id === variant_id);
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  const stock_before = variant.current_stock;
  let stock_after: number;

  if (action_type === "add") {
    stock_after = stock_before + Number(quantity);
  } else {
    stock_after = Math.max(0, stock_before - Number(quantity));
  }

  // Update stock
  await updateVariantStock(variant_id, stock_after);

  // Log the transaction
  const log = await createStockLog({
    item_id,
    variant_id,
    item_name,
    variant_label,
    action_type,
    quantity: Number(quantity),
    stock_before,
    stock_after,
    used_by_email: session.user.email || "",
    used_by_name: session.user.name || "",
    event: event || "",
    notes: notes || "",
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ log, stock_after });
}
