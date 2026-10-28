"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatDateTime, getStockStatusColor, getStockStatusText } from "@/lib/utils";
import { ItemVariant, StockLog, DashboardStats } from "@/types";
import { Package, Tag, AlertTriangle, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  user?: { name?: string | null; email?: string | null; image?: string | null; role: string };
  stats: DashboardStats;
  lowStockVariants: ItemVariant[];
  outOfStockVariants: ItemVariant[];
  recentLogs: StockLog[];
  topUsed: { label: string; total: number }[];
  categoryUsage: { name: string; total: number }[];
}

const PIE_COLORS = ["#6c8fff", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#38bdf8"];

const StatCard = ({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: number | string; sub?: string; color: string;
}) => (
  <div className="stat-card" style={{ background: "var(--bg-card)" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{sub}</p>}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-light)",
        borderRadius: 10, padding: "10px 14px", fontSize: 13,
      }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
        <p style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{payload[0].value} units used</p>
      </div>
    );
  }
  return null;
};

export default function DashboardClient({ user, stats, lowStockVariants, outOfStockVariants, recentLogs, topUsed, categoryUsage }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              {greeting}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Here&apos;s a snapshot of your stationery stock today.
            </p>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: user?.role === "admin" ? "rgba(108,143,255,0.12)" : "rgba(52,211,153,0.12)",
            color: user?.role === "admin" ? "var(--accent-primary)" : "var(--accent-emerald)",
            border: user?.role === "admin" ? "1px solid rgba(108,143,255,0.25)" : "1px solid rgba(52,211,153,0.25)",
            textTransform: "uppercase" as const, letterSpacing: "0.06em",
          }}>
            {user?.role === "admin" ? "🔑 School Head" : "👩‍🏫 Teacher"}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard icon={<Package size={20} />} label="Total Items" value={stats.totalItems} sub={`${stats.totalVariants} variants`} color="#6c8fff" />
        <StatCard icon={<Tag size={20} />} label="Categories" value={stats.totalCategories} sub="active categories" color="#a78bfa" />
        <StatCard icon={<TrendingUp size={20} />} label="Used This Month" value={stats.usageThisMonth} sub="units consumed" color="#34d399" />
        <StatCard icon={<AlertTriangle size={20} />} label="Low Stock" value={stats.lowStockCount} sub="need restocking" color="#fbbf24" />
        <StatCard icon={<Package size={20} />} label="Out of Stock" value={stats.outOfStockCount} sub="variants empty" color="#f87171" />
      </div>

      {/* Charts Row */}
      <div className="grid-charts" style={{ marginBottom: 20 }}>
        {/* Bar Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2 className="section-title">Top Used Items (This Month)</h2>
          </div>
          {topUsed.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topUsed} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v.length > 15 ? v.slice(0, 13) + "…" : v} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(108,143,255,0.06)" }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c8fff" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No usage data yet</div>
              <div className="empty-state-desc">Start logging stock usage to see charts here.</div>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2 className="section-title">By Category</h2>
          </div>
          {categoryUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryUsage} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {categoryUsage.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🥧</div>
              <div className="empty-state-title">No data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Alerts + Recent Activity */}
      <div className="grid-responsive-2" style={{ gap: 20 }}>
        {/* Alerts */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2 className="section-title">⚠️ Stock Alerts</h2>
          </div>
          {(lowStockVariants.length + outOfStockVariants.length) === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">All stock levels are healthy!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {outOfStockVariants.map((v) => (
                <div key={v.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{v.variant_label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.item_id}</div>
                  </div>
                  <span className="stat-badge out">Out of Stock</span>
                </div>
              ))}
              {lowStockVariants.map((v) => (
                <div key={v.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{v.variant_label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Only {v.current_stock} {v.unit || "units"} left</div>
                  </div>
                  <span className="stat-badge low">Low</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          {recentLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No activity yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentLogs.map((log) => (
                <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: log.action_type === "add" ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: log.action_type === "add" ? "#34d399" : "#f87171",
                  }}>
                    {log.action_type === "add" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.item_name} — {log.variant_label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {log.used_by_name} · {formatDateTime(log.created_at)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: log.action_type === "add" ? "#34d399" : "#f87171", flexShrink: 0 }}>
                    {log.action_type === "add" ? "+" : "-"}{log.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
