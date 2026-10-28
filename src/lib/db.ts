import { readSheet, appendRow, updateRow, deleteRow } from "./google-sheets";
import { Category, Item, ItemVariant, StockLog, AppEvent, AppUser } from "@/types";
import { v4 as uuidv4 } from "uuid";

const now = () => new Date().toISOString();

// ─── USERS ─────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AppUser[]> {
  const rows = await readSheet("users!A2:F1000");
  return rows.map((r) => ({
    email: r[0],
    name: r[1],
    role: r[2] as "admin" | "teacher",
    profile_image: r[3],
    last_login: r[4],
    created_at: r[5],
  }));
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const users = await getUsers();
  return users.find((u) => u.email === email) || null;
}

export async function createUser(user: Omit<AppUser, "created_at">): Promise<AppUser> {
  const newUser: AppUser = { ...user, created_at: now() };
  await appendRow("users", [newUser.email, newUser.name, newUser.role, newUser.profile_image || "", now(), newUser.created_at]);
  return newUser;
}

export async function updateUserRole(email: string, role: "admin" | "teacher"): Promise<void> {
  const rows = await readSheet("users!A2:F1000");
  const idx = rows.findIndex((r) => r[0] === email);
  if (idx === -1) throw new Error("User not found");
  const row = rows[idx];
  await updateRow("users", idx + 1, [row[0], row[1], role, row[3] || "", row[4] || "", row[5] || now()]);
}

export async function updateUserLastLogin(email: string): Promise<void> {
  const rows = await readSheet("users!A2:F1000");
  const idx = rows.findIndex((r) => r[0] === email);
  if (idx === -1) return;
  const row = rows[idx];
  await updateRow("users", idx + 1, [row[0], row[1], row[2], row[3] || "", now(), row[5] || now()]);
}

// ─── CATEGORIES ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const rows = await readSheet("categories!A2:E1000");
  return rows.map((r) => ({
    id: r[0], name: r[1], description: r[2], icon: r[3], created_at: r[4],
  }));
}

export async function createCategory(data: Omit<Category, "id" | "created_at">): Promise<Category> {
  const cat: Category = { id: uuidv4(), ...data, created_at: now() };
  await appendRow("categories", [cat.id, cat.name, cat.description, cat.icon, cat.created_at]);
  return cat;
}

export async function updateCategory(id: string, data: Partial<Omit<Category, "id" | "created_at">>): Promise<void> {
  const rows = await readSheet("categories!A2:E1000");
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error("Category not found");
  const row = rows[idx];
  await updateRow("categories", idx + 1, [
    row[0],
    data.name ?? row[1],
    data.description ?? row[2],
    data.icon ?? row[3],
    row[4],
  ]);
}

export async function deleteCategory(id: string): Promise<void> {
  const rows = await readSheet("categories!A2:E1000");
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error("Category not found");
  await deleteRow("categories", idx + 1);
}

// ─── ITEMS ─────────────────────────────────────────────────────────────────────

export async function getItems(): Promise<Item[]> {
  const rows = await readSheet("items!A2:G1000");
  return rows.map((r) => ({
    id: r[0],
    category_id: r[1],
    name: r[2],
    unit: r[3],
    has_variants: r[4] === "TRUE",
    variant_config: r[5] ? JSON.parse(r[5]) : [],
    created_at: r[6],
  }));
}

export async function getItemsByCategory(categoryId: string): Promise<Item[]> {
  const items = await getItems();
  return items.filter((i) => i.category_id === categoryId);
}

export async function createItem(data: Omit<Item, "id" | "created_at">): Promise<Item> {
  const item: Item = { id: uuidv4(), ...data, created_at: now() };
  await appendRow("items", [
    item.id, item.category_id, item.name, item.unit,
    item.has_variants ? "TRUE" : "FALSE",
    JSON.stringify(item.variant_config),
    item.created_at,
  ]);
  return item;
}

export async function updateItem(id: string, data: Partial<Omit<Item, "id" | "created_at">>): Promise<void> {
  const rows = await readSheet("items!A2:G1000");
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error("Item not found");
  const row = rows[idx];
  await updateRow("items", idx + 1, [
    row[0],
    data.category_id ?? row[1],
    data.name ?? row[2],
    data.unit ?? row[3],
    data.has_variants !== undefined ? (data.has_variants ? "TRUE" : "FALSE") : row[4],
    data.variant_config ? JSON.stringify(data.variant_config) : row[5],
    row[6],
  ]);
}

export async function deleteItem(id: string): Promise<void> {
  const rows = await readSheet("items!A2:G1000");
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error("Item not found");
  await deleteRow("items", idx + 1);
}

// ─── ITEM VARIANTS ─────────────────────────────────────────────────────────────

export async function getItemVariants(): Promise<ItemVariant[]> {
  const rows = await readSheet("item_variants!A2:L1000");
  return rows.map((r) => ({
    id: r[0],
    item_id: r[1],
    variant_label: r[2],
    color: r[3],
    size: r[4],
    type: r[5],
    grade: r[6],
    brand: r[7],
    pack_size: r[8],
    current_stock: parseFloat(r[9]) || 0,
    min_threshold: parseFloat(r[10]) || 5,
    created_at: r[11],
  }));
}

export async function getVariantsByItem(itemId: string): Promise<ItemVariant[]> {
  const variants = await getItemVariants();
  return variants.filter((v) => v.item_id === itemId);
}

export async function createVariant(data: Omit<ItemVariant, "id" | "created_at">): Promise<ItemVariant> {
  const variant: ItemVariant = { id: uuidv4(), ...data, created_at: now() };
  await appendRow("item_variants", [
    variant.id, variant.item_id, variant.variant_label,
    variant.color || "", variant.size || "", variant.type || "",
    variant.grade || "", variant.brand || "", variant.pack_size || "",
    variant.current_stock, variant.min_threshold, variant.created_at,
  ]);
  return variant;
}

export async function updateVariantStock(
  variantId: string,
  newStock: number
): Promise<void> {
  const rows = await readSheet("item_variants!A2:L1000");
  const idx = rows.findIndex((r) => r[0] === variantId);
  if (idx === -1) throw new Error("Variant not found");
  const row = rows[idx];
  await updateRow("item_variants", idx + 1, [
    row[0], row[1], row[2], row[3], row[4], row[5],
    row[6], row[7], row[8], newStock, row[10], row[11],
  ]);
}

export async function updateVariant(
  id: string,
  data: Partial<Omit<ItemVariant, "id" | "created_at">>
): Promise<void> {
  const rows = await readSheet("item_variants!A2:L1000");
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error("Variant not found");
  const row = rows[idx];
  await updateRow("item_variants", idx + 1, [
    row[0],
    data.item_id ?? row[1],
    data.variant_label ?? row[2],
    data.color ?? row[3],
    data.size ?? row[4],
    data.type ?? row[5],
    data.grade ?? row[6],
    data.brand ?? row[7],
    data.pack_size ?? row[8],
    data.current_stock ?? row[9],
    data.min_threshold ?? row[10],
    row[11],
  ]);
}

export async function deleteVariant(id: string): Promise<void> {
  const rows = await readSheet("item_variants!A2:L1000");
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error("Variant not found");
  await deleteRow("item_variants", idx + 1);
}

// ─── STOCK LOGS ────────────────────────────────────────────────────────────────

export async function getStockLogs(): Promise<StockLog[]> {
  const rows = await readSheet("stock_logs!A2:N1000");
  return rows.map((r) => ({
    id: r[0], item_id: r[1], variant_id: r[2], item_name: r[3],
    variant_label: r[4], action_type: r[5] as "add" | "use",
    quantity: parseFloat(r[6]) || 0,
    stock_before: parseFloat(r[7]) || 0,
    stock_after: parseFloat(r[8]) || 0,
    used_by_email: r[9], used_by_name: r[10],
    event: r[11], notes: r[12], created_at: r[13],
  }));
}

export async function createStockLog(data: Omit<StockLog, "id">): Promise<StockLog> {
  const log: StockLog = { id: uuidv4(), ...data };
  await appendRow("stock_logs", [
    log.id, log.item_id, log.variant_id, log.item_name, log.variant_label,
    log.action_type, log.quantity, log.stock_before, log.stock_after,
    log.used_by_email, log.used_by_name, log.event || "", log.notes || "", log.created_at,
  ]);
  return log;
}

// ─── EVENTS ────────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<AppEvent[]> {
  const rows = await readSheet("events!A2:F1000");
  return rows.map((r) => ({
    id: r[0], name: r[1], date: r[2], description: r[3],
    created_by: r[4], created_at: r[5],
  }));
}

export async function createEvent(data: Omit<AppEvent, "id" | "created_at">): Promise<AppEvent> {
  const event: AppEvent = { id: uuidv4(), ...data, created_at: now() };
  await appendRow("events", [event.id, event.name, event.date, event.description || "", event.created_by, event.created_at]);
  return event;
}

export async function updateEvent(id: string, data: Partial<Omit<AppEvent, "id" | "created_at">>): Promise<void> {
  const rows = await readSheet("events!A2:F1000");
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error("Event not found");
  const row = rows[idx];
  await updateRow("events", idx + 1, [
    row[0], data.name ?? row[1], data.date ?? row[2],
    data.description ?? row[3], row[4], row[5],
  ]);
}

export async function deleteEvent(id: string): Promise<void> {
  const rows = await readSheet("events!A2:F1000");
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) throw new Error("Event not found");
  await deleteRow("events", idx + 1);
}
