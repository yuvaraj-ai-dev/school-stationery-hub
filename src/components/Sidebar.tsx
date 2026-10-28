"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Package, Tag, List, ClipboardList,
  CalendarHeart, Settings, LogOut, ChevronRight, Bell, BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/stock", icon: Package, label: "Stock" },
  { href: "/items", icon: List, label: "Items" },
  { href: "/categories", icon: Tag, label: "Categories" },
  { href: "/logs", icon: ClipboardList, label: "Usage Logs" },
  { href: "/events", icon: CalendarHeart, label: "Events" },
  { href: "/instructions", icon: BookOpen, label: "Instructions" },
];

const adminItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <aside style={{
      width: "var(--sidebar-width)",
      minWidth: "var(--sidebar-width)",
      height: "100vh",
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "var(--gradient-1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 16px rgba(108,143,255,0.3)",
            flexShrink: 0,
          }}>
            📦
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: "var(--text-primary)" }}>
              StationeryHub
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Preschool Manager</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 6px 8px" }}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}

        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "16px 6px 8px" }}>
          Admin
        </div>
        {adminItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
        {session?.user && (
          <div style={{ padding: "10px 12px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || ""}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--border-light)" }}
                />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--gradient-1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "white",
                }}>
                  {session.user.name?.[0] || "?"}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 99,
                    background: isAdmin ? "rgba(108,143,255,0.15)" : "rgba(52,211,153,0.12)",
                    color: isAdmin ? "var(--accent-primary)" : "var(--accent-emerald)",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>
                    {isAdmin ? "Admin" : "Teacher"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="nav-item"
          style={{ width: "100%", border: "none", background: "none", color: "var(--accent-red)" }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
