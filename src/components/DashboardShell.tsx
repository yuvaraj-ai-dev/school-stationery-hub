"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import {
  Menu, Package, LayoutDashboard, List, ClipboardList, BookOpen,
} from "lucide-react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Bottom navigation items for quick 1-thumb mobile access
  const bottomNavItems = [
    { href: "/stock", icon: Package, label: "Stock" },
    { href: "/items", icon: List, label: "Items" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/logs", icon: ClipboardList, label: "Logs" },
    { href: "/instructions", icon: BookOpen, label: "Guide" },
  ];

  return (
    <div className="app-layout">
      {/* Mobile Top Header (100% width at top, visible ONLY on mobile <= 768px) */}
      <header className="mobile-top-header">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            padding: "8px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
          }}
        >
          <Menu size={22} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📦</span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
            StationeryHub
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 99,
            background: isAdmin ? "rgba(108,143,255,0.15)" : "rgba(52,211,153,0.15)",
            color: isAdmin ? "var(--accent-primary)" : "var(--accent-emerald)",
            textTransform: "uppercase",
          }}>
            {isAdmin ? "Admin" : "Teacher"}
          </span>
        </div>
      </header>

      {/* Main app body container */}
      <div className="app-body">
        {/* Sidebar: desktop fixed sticky / mobile fixed drawer off-screen */}
        <Sidebar isOpen={isMobileMenuOpen} onClose={closeMenu} />

        {/* Main Content Area */}
        <main className="app-main">
          {children}
        </main>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Bottom Navigation (Visible ONLY on mobile <= 768px) */}
      <nav className="mobile-bottom-nav">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-item ${active ? "active" : ""}`}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
