"use client";
import { useEffect, useState } from "react";
import { AppUser } from "@/types";
import toast from "react-hot-toast";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { Shield, User, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetch("/api/users").then(r => r.json()).then(data => {
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [session]);

  async function claimAdminRole() {
    setClaiming(true);
    try {
      const res = await fetch("/api/users/claim-admin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim admin role");
      toast.success(data.message || "Admin role granted! Signing out to refresh session...", { duration: 4000 });
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to claim admin role";
      toast.error(message);
    } finally {
      setClaiming(false);
    }
  }

  async function updateRole(email: string, role: "admin" | "teacher") {
    setSaving(email);
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      toast.success(`Role updated to ${role}`);
      setUsers(prev => prev.map(u => u.email === email ? { ...u, role } : u));
    } catch { toast.error("Failed to update role"); }
    setSaving(null);
  }

  if (session?.user?.role !== "admin") {
    return (
      <div className="page-content">
        <div className="glass-card empty-state" style={{ marginTop: 40, maxWidth: 520, margin: "40px auto", padding: 36, textAlign: "center" }}>
          <div className="empty-state-icon" style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
          <div className="empty-state-title" style={{ fontSize: 20, marginBottom: 8 }}>Admin Access Required</div>
          <div className="empty-state-desc" style={{ marginBottom: 24, fontSize: 14 }}>
            Only school heads have access to settings and user management.
            If you are setting up the system or are the only registered user, click below to claim the School Head (Admin) role.
          </div>
          <button
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}
            disabled={claiming}
            onClick={claimAdminRole}
          >
            {claiming ? <div className="spinner" style={{ width: 16, height: 16 }} /> : "🔑 Claim School Head (Admin) Role"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
          ⚙️ Settings
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Manage user roles and access permissions</p>
      </div>

      {/* Current User Info */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>Your Account</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--border-light)" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gradient-1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "white" }}>
              {session?.user?.name?.[0]}
            </div>
          )}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{session?.user?.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{session?.user?.email}</div>
            <span style={{
              marginTop: 6, display: "inline-block",
              padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
              background: "rgba(108,143,255,0.15)", color: "var(--accent-primary)",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              🔑 School Head (Admin)
            </span>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>👥 User Management</h2>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{users.length} users registered</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 20px" }}>
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No users yet</div>
            <div className="empty-state-desc">Users will appear here after they first log in with Google.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Last Login</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.email}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "var(--gradient-1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: "white",
                      }}>
                        {user.name[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{user.email}</td>
                  <td>
                    <span style={{
                      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: user.role === "admin" ? "rgba(108,143,255,0.15)" : "rgba(52,211,153,0.12)",
                      color: user.role === "admin" ? "var(--accent-primary)" : "var(--accent-emerald)",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      {user.role === "admin" ? "🔑 Admin" : "👩‍🏫 Teacher"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.last_login ? formatDateTime(user.last_login) : "Never"}</td>
                  <td>
                    {user.email === session?.user?.email ? (
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>That&apos;s you</span>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className={user.role === "admin" ? "btn-warning" : "btn-primary"}
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          disabled={saving === user.email}
                          onClick={() => updateRole(user.email, user.role === "admin" ? "teacher" : "admin")}
                        >
                          {saving === user.email ? <div className="spinner" style={{ width: 14, height: 14 }} /> : (
                            user.role === "admin" ? "Demote to Teacher" : "Promote to Admin"
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Setup Guide */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>📋 Setup Checklist</h2>
        {[
          { done: true, label: "Google OAuth configured", desc: "Users can sign in with Google" },
          { done: !!process.env.NEXT_PUBLIC_SHEETS_CONFIGURED, label: "Google Sheets connected", desc: "Set GOOGLE_SHEETS_ID in environment variables" },
          { done: users.length > 0, label: "First user registered", desc: "At least one user has logged in" },
          { done: false, label: "Initial stock data entered", desc: "Go to Items & Categories to add your stationery" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < 3 ? "1px solid var(--border)" : undefined }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              background: item.done ? "rgba(52,211,153,0.15)" : "var(--bg-secondary)",
              border: item.done ? "1px solid rgba(52,211,153,0.4)" : "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13,
            }}>
              {item.done ? "✓" : "○"}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: item.done ? "var(--text-primary)" : "var(--text-muted)" }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
