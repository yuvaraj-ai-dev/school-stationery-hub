import { auth } from "@/lib/auth";
import { getItemVariants, getStockLogs, getCategories, getItems } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  let variants: Awaited<ReturnType<typeof getItemVariants>> = [];
  let logs: Awaited<ReturnType<typeof getStockLogs>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let items: Awaited<ReturnType<typeof getItems>> = [];

  try {
    [variants, logs, categories, items] = await Promise.all([
      getItemVariants(), getStockLogs(), getCategories(), getItems(),
    ]);
  } catch {
    // Sheets not set up yet
  }

  // Compute stats
  const totalVariants = variants.length;
  const lowStock = variants.filter((v) => v.current_stock > 0 && v.current_stock <= v.min_threshold);
  const outOfStock = variants.filter((v) => v.current_stock === 0);

  // Usage this month
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString();
  const usageLogs = logs.filter((l) => l.action_type === "use" && l.created_at >= monthStart);
  const usageThisMonth = usageLogs.reduce((sum, l) => sum + l.quantity, 0);

  // Recent 10 logs
  const recentLogs = [...logs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);

  // Top used items this month
  const usageByVariant: Record<string, { label: string; total: number }> = {};
  for (const log of usageLogs) {
    if (!usageByVariant[log.variant_id]) {
      usageByVariant[log.variant_id] = { label: `${log.item_name} (${log.variant_label})`, total: 0 };
    }
    usageByVariant[log.variant_id].total += log.quantity;
  }
  const topUsed = Object.values(usageByVariant)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Usage by category
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const usageByCat: Record<string, { name: string; total: number }> = {};
  for (const log of usageLogs) {
    const item = itemMap.get(log.item_id);
    if (item) {
      const cat = categoryMap.get(item.category_id);
      const catName = cat?.name || "Unknown";
      if (!usageByCat[catName]) usageByCat[catName] = { name: catName, total: 0 };
      usageByCat[catName].total += log.quantity;
    }
  }
  const categoryUsage = Object.values(usageByCat);

  return (
    <DashboardClient
      user={session?.user}
      stats={{
        totalItems: items.length,
        totalVariants,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        totalCategories: categories.length,
        usageThisMonth,
      }}
      lowStockVariants={lowStock.slice(0, 5)}
      outOfStockVariants={outOfStock.slice(0, 5)}
      recentLogs={recentLogs}
      topUsed={topUsed}
      categoryUsage={categoryUsage}
    />
  );
}
