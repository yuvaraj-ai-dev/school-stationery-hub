import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateVariantStock, createStockLog, createStockLogs, getItemVariants } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // ─── 1. Bulk Transactions (Array of items) ──────────────────────────────────
  if (body.items && Array.isArray(body.items) && body.items.length > 0) {
    const { items, event, notes } = body;
    const variants = await getItemVariants();

    // Pre-validate all items
    for (const item of items) {
      const v = variants.find((variant) => variant.id === item.variant_id);
      if (!v) {
        return NextResponse.json({ error: `Variant not found: ${item.variant_label || item.variant_id}` }, { status: 404 });
      }
      const qty = Number(item.quantity);
      if (!qty || qty <= 0) {
        return NextResponse.json({ error: `Invalid quantity for ${item.variant_label || v.variant_label}` }, { status: 400 });
      }
      const action = item.action_type || "use";
      if (action === "use" && qty > v.current_stock) {
        return NextResponse.json({
          error: `Insufficient stock for ${v.variant_label}. Available: ${v.current_stock}, Requested: ${qty}`,
        }, { status: 400 });
      }
    }

    // Process all updates
    const nowIso = new Date().toISOString();
    const logsToCreate = [];

    for (const item of items) {
      const v = variants.find((variant) => variant.id === item.variant_id)!;
      const qty = Number(item.quantity);
      const action = item.action_type || "use";
      const stock_before = v.current_stock;
      const stock_after = action === "add" ? stock_before + qty : Math.max(0, stock_before - qty);

      // Update variant stock in Google Sheets
      await updateVariantStock(item.variant_id, stock_after);
      v.current_stock = stock_after; // update local cache

      logsToCreate.push({
        item_id: item.item_id || v.item_id,
        variant_id: item.variant_id,
        item_name: item.item_name,
        variant_label: item.variant_label || v.variant_label,
        action_type: action as "add" | "use",
        quantity: qty,
        stock_before,
        stock_after,
        used_by_email: session.user.email || "",
        used_by_name: session.user.name || "",
        event: item.event || event || "",
        notes: item.notes || notes || "",
        created_at: nowIso,
      });
    }

    // Batch append logs to Google Sheets
    await createStockLogs(logsToCreate);

    return NextResponse.json({ success: true, count: logsToCreate.length, logs: logsToCreate });
  }

  // ─── 2. Single Transaction ──────────────────────────────────────────────────
  const { variant_id, action_type, quantity, event, notes, item_name, item_id, variant_label } = body;

  const variants = await getItemVariants();
  const variant = variants.find((v) => v.id === variant_id);
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  const qty = Number(quantity);
  if (!qty || qty <= 0) return NextResponse.json({ error: "Enter a valid quantity" }, { status: 400 });

  const stock_before = variant.current_stock;
  if (action_type === "use" && qty > stock_before) {
    return NextResponse.json({ error: `Cannot use more than current stock (${stock_before})` }, { status: 400 });
  }

  let stock_after: number;
  if (action_type === "add") {
    stock_after = stock_before + qty;
  } else {
    stock_after = Math.max(0, stock_before - qty);
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
    quantity: qty,
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
