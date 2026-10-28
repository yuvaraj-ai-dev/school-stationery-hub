"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      position: "relative",
      overflow: "hidden",
      padding: "20px 16px",
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,143,255,0.08) 0%, transparent 70%)",
        top: -200, left: -200, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
        bottom: -100, right: -100, pointerEvents: "none",
      }} />

      {/* Card */}
      <div className="glass-card animate-slide-up" style={{
        width: "100%", maxWidth: 440, padding: "48px 40px", textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 24px",
          background: "var(--gradient-1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, boxShadow: "0 12px 40px rgba(108,143,255,0.3)",
        }}>
          📦
        </div>

        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 28, fontWeight: 800, marginBottom: 8,
          color: "var(--text-primary)",
        }}>
          StationeryHub
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>
          Preschool Stationery Management
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>
          Track stock levels, manage categories, and monitor usage — all in one place.
        </p>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Sign in to continue</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Google Button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 20px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            background: loading ? "var(--bg-secondary)" : "white",
            border: "1px solid var(--border)",
            borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
            fontSize: 15, fontWeight: 600, color: "#111",
            transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 4px 20px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          {loading ? (
            <div className="spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p style={{ marginTop: 24, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Only school-registered Google accounts can access this system. Contact your admin if you can&apos;t sign in.
        </p>

        {/* Features */}
        <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { icon: "📊", label: "Dashboard" },
            { icon: "📦", label: "Stock Mgmt" },
            { icon: "🎉", label: "Events" },
          ].map((f) => (
            <div key={f.label} style={{
              padding: "14px 8px", borderRadius: 12,
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              fontSize: 12, color: "var(--text-muted)",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
