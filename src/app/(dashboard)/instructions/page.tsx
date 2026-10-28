"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen, CheckCircle2, AlertTriangle, Shield, UserCheck,
  Package, ArrowDown, ArrowUp, Calendar, Tag, Layers, HelpCircle,
  Sparkles, FileText, Check, AlertCircle, Info, Phone, MessageSquare,
  Smartphone, ShoppingCart, ListChecks, ChevronRight
} from "lucide-react";

type InstructionTab = "teacher" | "admin" | "hiring" | "matrix" | "rules";

export default function InstructionsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [activeTab, setActiveTab] = useState<InstructionTab>("teacher");

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: "26px 28px",
        marginBottom: 24,
        background: "linear-gradient(135deg, rgba(108,143,255,0.12) 0%, rgba(167,139,250,0.08) 100%)",
        border: "1px solid rgba(108,143,255,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>📖</span>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                Stationery &amp; School Management Guide
              </h1>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 720, lineHeight: 1.6 }}>
              Standard operating procedures for preschool teachers and school administration. Learn how to log daily classroom usage, manage stock refills, create items and variants, and track teacher/ayyamma hiring callers.
            </p>
          </div>

          <div style={{
            padding: "8px 14px",
            borderRadius: 12,
            background: isAdmin ? "rgba(108,143,255,0.15)" : "rgba(52,211,153,0.15)",
            border: isAdmin ? "1px solid rgba(108,143,255,0.3)" : "1px solid rgba(52,211,153,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            {isAdmin ? <Shield size={16} color="var(--accent-primary)" /> : <UserCheck size={16} color="var(--accent-emerald)" />}
            <span style={{ fontSize: 13, fontWeight: 700, color: isAdmin ? "var(--accent-primary)" : "var(--accent-emerald)" }}>
              {isAdmin ? "🔑 Logged in as: School Head (Admin)" : "👩‍🏫 Logged in as: Teacher"}
            </span>
          </div>
        </div>

        {/* Global Notice: Admin instructions visible to all */}
        <div style={{
          marginTop: 18,
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(108,143,255,0.08)",
          border: "1px solid rgba(108,143,255,0.2)",
          fontSize: 12,
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <Info size={15} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
          <span>
            <strong>Note for All Staff:</strong> Admin instructions and master setup guidelines are visible to teachers as well so everyone understands the full workflow, catalog setup, stock refill schedules, and hiring tracking.
          </span>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
          <button
            className={`chip ${activeTab === "teacher" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700 }}
            onClick={() => setActiveTab("teacher")}
          >
            👩‍🏫 Teacher Guide: Stock Usage
          </button>
          <button
            className={`chip ${activeTab === "admin" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700 }}
            onClick={() => setActiveTab("admin")}
          >
            🔑 Admin Guide: Master Setup &amp; Stock Refill
          </button>
          <button
            className={`chip ${activeTab === "hiring" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700 }}
            onClick={() => setActiveTab("hiring")}
          >
            📞 Staff Hiring &amp; Caller Tracker
          </button>
          <button
            className={`chip ${activeTab === "matrix" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700 }}
            onClick={() => setActiveTab("matrix")}
          >
            🎨 Category &amp; Variant Cheat Sheet
          </button>
          <button
            className={`chip ${activeTab === "rules" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700 }}
            onClick={() => setActiveTab("rules")}
          >
            ✅ Mandatory Rules &amp; FAQ
          </button>
        </div>
      </div>

      {/* ================= TAB 1: TEACHER GUIDE (DAILY USAGE) ================= */}
      {activeTab === "teacher" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Key Principle Alert */}
          <div className="glass-card" style={{
            padding: 20,
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.3)",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}>
            <AlertCircle size={22} style={{ color: "var(--accent-amber)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "var(--accent-amber)", marginBottom: 4 }}>
                The Golden Rule: Stock Refill is Monthly, but Usage Update is DAILY!
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                New stock boxes arrive at the school only <strong>once a month or per term</strong>. However, <strong>Usage Update is performed regularly every day</strong> whenever you collect materials from the cupboard for drawing, craft, rhyme charts, or celebration activities.
                <br />
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  ⚠️ If usage is not logged immediately, Google Sheets will show materials in stock when the cupboard is actually empty, and other teachers won&apos;t know what happened to the supplies!
                </span>
              </div>
            </div>
          </div>

          {/* Two Ways to Log Usage */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <ArrowDown size={20} color="var(--accent-emerald)" />
              Two Convenient Ways to Log Usage on Mobile or Desktop
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
              Teachers can use either the new <strong>Bulk / Quick Usage</strong> catalog or direct single-item buttons.
            </p>

            <div className="grid-responsive-2" style={{ gap: 16 }}>
              {/* Method A: Bulk Usage */}
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 14,
                padding: 18,
                border: "1px solid rgba(108,143,255,0.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>⚡</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "var(--accent-primary)" }}>
                    Method 1: Bulk Log Usage (Recommended)
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
                  Best when taking <strong>multiple items</strong> for an activity (e.g. 12 Chart papers + 2 Glue sticks + 1 Crayon box) in one trip.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                  <div><strong>1. Click:</strong> Tap the blue <strong>&quot;Bulk Log Usage&quot;</strong> button at the top of the Stock page.</div>
                  <div><strong>2. Event Tag:</strong> Select the Event (e.g., <em>Diwali Craft</em>, <em>Sports Day</em>, or <em>Daily Classroom Use</em>).</div>
                  <div><strong>3. Browse &amp; Search:</strong> Use category chips or type in the search bar (e.g. <em>&quot;chart&quot;</em>, <em>&quot;crayons&quot;</em>).</div>
                  <div><strong>4. One-Tap Stepper:</strong> Tap <strong>&quot;+ Use&quot;</strong>, then use <strong>[-]</strong> and <strong>[+]</strong> touch buttons to adjust quantities.</div>
                  <div><strong>5. Review &amp; Submit:</strong> Switch to the <strong>&quot;🛒 Selected&quot;</strong> tab to review and tap <strong>&quot;Confirm Usage&quot;</strong>. Done!</div>
                </div>
              </div>

              {/* Method B: Single Item Usage */}
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 14,
                padding: 18,
                border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)" }}>
                    Method 2: Direct Single Item Usage
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
                  Best when taking just <strong>1 specific item</strong> (e.g. 1 Whiteboard marker or 1 ream of paper).
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                  <div><strong>1. Locate:</strong> Find the stationery card on your mobile screen or search in the list.</div>
                  <div><strong>2. Click:</strong> Tap the yellow <strong>&quot;↓ Use Stock&quot;</strong> button on that card.</div>
                  <div><strong>3. Quick Chips:</strong> Tap preset chips like <strong>+1</strong>, <strong>+2</strong>, <strong>+5</strong>, or <strong>All</strong> without opening your keyboard!</div>
                  <div><strong>4. Note:</strong> Enter an optional note or select an event.</div>
                  <div><strong>5. Submit:</strong> Tap <strong>&quot;Log Usage&quot;</strong>. Stock and Google Sheets update immediately.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Responsiveness Tips */}
          <div className="glass-card" style={{ padding: 22, borderLeft: "4px solid var(--accent-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Smartphone size={20} style={{ color: "var(--accent-secondary)" }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                Tips for Teachers Updating Stock on Mobile Phones
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
              <div style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 10 }}>
                📱 <strong>Vertical Card View:</strong> On mobile, tables turn into swipeable touch cards with clear stock numbers so you don&apos;t have to zoom in.
              </div>
              <div style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 10 }}>
                🔘 <strong>Quick Touch Steppers:</strong> Use <strong>[-]</strong> and <strong>[+]</strong> buttons instead of typing on small numeric phone keyboards.
              </div>
              <div style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 10 }}>
                🏷️ <strong>Category Chips:</strong> Tap the category chips at the top to filter immediately without typing long words.
              </div>
            </div>
          </div>

          {/* Concrete Teacher Usage Example */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              Real Example: Taking materials for LKG Activity
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
              Suppose you are preparing for <strong>&quot;Janmashtami Craft Workshop&quot;</strong> and taking materials:
            </p>
            <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 14, fontSize: 13, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>🔹 <strong>Material 1:</strong> <code>Chart Paper — Yellow - Full Sheet</code> | Qty: <code>15 sheets</code> | Event: <code>Janmashtami Celebration</code> | Notes: <code>Crowns &amp; flute cutouts</code></div>
              <div>🔹 <strong>Material 2:</strong> <code>Glitter Foam Sheet — Gold - A4</code> | Qty: <code>4 sheets</code> | Event: <code>Janmashtami Celebration</code> | Notes: <code>Peacock feather craft</code></div>
              <div>🔹 <strong>Material 3:</strong> <code>Fevicol Glue — 100g Squeezy Bottle</code> | Qty: <code>2 bottles</code> | Event: <code>Janmashtami Celebration</code> | Notes: <code>Classroom supply for Mrs. Kavitha</code></div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ADMIN GUIDE (MASTER SETUP & REFILL) ================= */}
      {activeTab === "admin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Shield size={22} style={{ color: "var(--accent-primary)" }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                Admin &amp; Management Workflow (Open to all staff to understand setup)
              </h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              School heads and administrators configure the catalog hierarchy, manage bulk refills when new purchase shipments arrive, and monitor inventory levels.
            </p>

            {/* Hierarchy Pipeline */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "14px 18px",
              background: "var(--bg-secondary)", borderRadius: 12, marginBottom: 24,
              overflowX: "auto"
            }}>
              <span className="tag tag-blue" style={{ fontSize: 12, padding: "6px 12px" }}>1. Categories</span>
              <span style={{ color: "var(--text-muted)" }}>➜</span>
              <span className="tag tag-purple" style={{ fontSize: 12, padding: "6px 12px" }}>2. Parent Items &amp; Units</span>
              <span style={{ color: "var(--text-muted)" }}>➜</span>
              <span className="tag tag-green" style={{ fontSize: 12, padding: "6px 12px" }}>3. Color/Size Variants</span>
              <span style={{ color: "var(--text-muted)" }}>➜</span>
              <span className="tag tag-amber" style={{ fontSize: 12, padding: "6px 12px" }}>4. Monthly Stock Refill</span>
            </div>

            {/* 4 Core Setup Modules */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Module 1: Categories */}
              <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Tag size={18} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    1. Categories (/categories)
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                  High-level groupings to organize school supplies. Each category has an icon and name:
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
                  <span className="tag tag-blue">📄 Paper &amp; Chart Materials</span>
                  <span className="tag tag-purple">🖍️ Drawing &amp; Coloring Supplies</span>
                  <span className="tag tag-pink">🎨 Art &amp; Craft Materials</span>
                  <span className="tag tag-amber">📒 General Stationery</span>
                  <span className="tag tag-green">🧹 Cleaning &amp; Hygiene Consumables</span>
                </div>
              </div>

              {/* Module 2: Items & Variant Configuration */}
              <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Layers size={18} color="var(--accent-secondary)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    2. Items &amp; Variant Attributes (/items)
                  </h3>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  • <strong>Parent Item:</strong> The overarching product name (e.g., <em>Chart Paper</em>, <em>Wax Crayons</em>, <em>Whiteboard Marker</em>) and its unit of measure (e.g., <em>sheets</em>, <em>boxes</em>, <em>bottles</em>).<br />
                  • <strong>Variant Tracking:</strong> Check attributes that distinguish items (Color, Size, Grade, Pack Size, Brand).<br />
                  • <strong>Variants:</strong> Specific options teachers actually pick (e.g., <em>White - A1</em>, <em>Yellow - A1</em>, <em>Black - Chisel Tip</em>).
                </div>
              </div>

              {/* Module 3: Stock Refills */}
              <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <ArrowUp size={18} color="var(--accent-emerald)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    3. Adding Stock / Refills (When Purchase Shipment Arrives)
                  </h3>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  • When a vendor delivers new stationery boxes, go to <strong>Stock</strong>.<br />
                  • Click <strong>&quot;↑ Add Stock&quot;</strong> on the corresponding variant card.<br />
                  • Enter quantity received (e.g. <code>+100 sheets</code>), enter vendor invoice note in <strong>Notes</strong>, and submit.<br />
                  • Live stock increases immediately, updating all teacher displays and Google Sheets.
                </div>
              </div>

              {/* Module 4: Events Calendar */}
              <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Calendar size={18} color="#ec4899" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    4. Events &amp; Celebrations (/events)
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                  Create school events in advance (e.g. <em>Independence Day Craft</em>, <em>Sports Day 2026</em>, <em>Grandparents Day</em>).
                </p>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Linking stock usage to events enables school management to generate exact expenditure and material consumption reports for every school celebration!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: STAFF HIRING & CALLER TRACKER ================= */}
      {activeTab === "hiring" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Phone size={22} style={{ color: "var(--accent-primary)" }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                Staff Hiring &amp; Caller Tracker (/hiring)
              </h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              The school places posters, banners, and flyers with contact numbers to recruit preschool <strong>Teachers</strong> and <strong>Ayyamma (Helpers / Caretakers)</strong>. This tracker ensures no incoming candidate inquiry is ever lost or misplaced.
            </p>

            <div className="grid-responsive-2" style={{ gap: 16 }}>
              {/* How it works */}
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 14,
                padding: 18,
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--accent-primary)", marginBottom: 10 }}>
                  📋 When an Interested Candidate Calls:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  <div><strong>1. Open Hiring Page:</strong> Go to <strong>&quot;Hiring &amp; Calls&quot;</strong> in the sidebar.</div>
                  <div><strong>2. Tap &quot;Log New Call&quot;:</strong> Enter candidate name and their 10-digit phone number.</div>
                  <div><strong>3. Strict Phone Validation:</strong> The app enforces Indian 10-digit numbers starting with 6, 7, 8, or 9 and blocks non-numeric text.</div>
                  <div><strong>4. Note Crucial Details:</strong> Role (Teacher/Ayyamma), residential area (commute distance), experience, and initial impressions.</div>
                  <div><strong>5. Save:</strong> Record is immediately saved in the <code>hiring_candidates</code> Google Sheet.</div>
                </div>
              </div>

              {/* Direct Actions */}
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 14,
                padding: 18,
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--accent-emerald)", marginBottom: 10 }}>
                  ⚡ Quick Action Superpowers:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  <div><strong>📞 1-Tap Calling:</strong> Tap <strong>&quot;Call Now&quot;</strong> directly on mobile to dial the applicant immediately.</div>
                  <div><strong>💬 1-Tap WhatsApp:</strong> Tap <strong>&quot;WhatsApp&quot;</strong> to open a pre-drafted official greeting message to invite them for an interview.</div>
                  <div><strong>🔄 1-Click Status:</strong> Move applicant from <em>Inquiry</em> ➜ <em>Interview Scheduled</em> ➜ <em>Interview Done</em> ➜ <em>Selected / Joined</em> with a single tap.</div>
                  <div><strong>📥 Export CSV:</strong> Download the candidate list at any time for trustee or management reviews.</div>
                </div>
              </div>
            </div>

            {/* Candidate Lifecycle */}
            <div style={{ marginTop: 20, padding: 16, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
                Recruitment Stages Explained:
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
                <span className="tag tag-blue">📞 Inquiry / Called: Initial caller</span>
                <span className="tag tag-purple">📅 Interview Scheduled: Date/time set for school demo</span>
                <span className="tag tag-amber">✅ Interview Done: Attended demo at school</span>
                <span className="tag tag-green">🎉 Selected / Offered: Offer letter given</span>
                <span className="tag tag-green">🤝 Joined: Working at school</span>
                <span className="tag tag-red">❌ Rejected / Dropped: Did not qualify or decline</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CATEGORY & VARIANT CHEAT SHEET ================= */}
      {activeTab === "matrix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: "var(--text-primary)" }}>
              🎨 Recommended Variant Attributes by Category
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
              Use this reference guide when adding new items so that every category is organized logically.
            </p>

            <div className="table-responsive">
              <table className="data-table" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Item Example</th>
                    <th>Tracked Attributes</th>
                    <th>Example Generated Variants</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="tag tag-blue">📄 Paper &amp; Chart</span></td>
                    <td style={{ fontWeight: 600 }}>Chart Paper</td>
                    <td><code>color</code>, <code>size</code></td>
                    <td>White - Full Sheet, Yellow - Full Sheet, Light Blue - Full Sheet</td>
                    <td>sheets</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-blue">📄 Paper &amp; Chart</span></td>
                    <td style={{ fontWeight: 600 }}>Colored Craft Paper</td>
                    <td><code>color</code>, <code>size</code></td>
                    <td>Assorted Colors - A4, Pastel Green - A4, Neon Pink - A4</td>
                    <td>reams / packs</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-purple">🖍️ Drawing &amp; Color</span></td>
                    <td style={{ fontWeight: 600 }}>Wax Crayons</td>
                    <td><code>brand</code>, <code>pack_size</code></td>
                    <td>Camlin - 12 Shades, Faber-Castell - 24 Shades Jumbo</td>
                    <td>boxes</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-purple">🖍️ Drawing &amp; Color</span></td>
                    <td style={{ fontWeight: 600 }}>Poster Colors</td>
                    <td><code>color</code>, <code>pack_size</code></td>
                    <td>Red - 100ml, Royal Blue - 100ml, 12 Shades Set</td>
                    <td>bottles / sets</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-pink">🎨 Art &amp; Craft</span></td>
                    <td style={{ fontWeight: 600 }}>EVA Foam Sheets</td>
                    <td><code>color</code>, <code>type</code>, <code>size</code></td>
                    <td>Glitter Gold - Self-Adhesive - A4, Plain Multi - A4</td>
                    <td>sheets</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-pink">🎨 Art &amp; Craft</span></td>
                    <td style={{ fontWeight: 600 }}>Ice-Cream Sticks</td>
                    <td><code>type</code>, <code>pack_size</code></td>
                    <td>Plain Natural - 100pcs, Multi-Colored - 100pcs</td>
                    <td>packets</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-pink">🎨 Art &amp; Craft</span></td>
                    <td style={{ fontWeight: 600 }}>Googly Eyes</td>
                    <td><code>size</code>, <code>pack_size</code></td>
                    <td>10mm Small - 100pcs, 20mm Large - 50pcs</td>
                    <td>packets</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-amber">📒 General Stationery</span></td>
                    <td style={{ fontWeight: 600 }}>Whiteboard Markers</td>
                    <td><code>color</code>, <code>type</code></td>
                    <td>Black - Bullet Tip, Blue - Bullet Tip, Red - Chisel Tip</td>
                    <td>pcs</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-amber">📒 General Stationery</span></td>
                    <td style={{ fontWeight: 600 }}>Tapes</td>
                    <td><code>type</code>, <code>size</code></td>
                    <td>Masking Tape - 24mm, Cellophane Clear - 12mm</td>
                    <td>rolls</td>
                  </tr>
                  <tr>
                    <td><span className="tag tag-green">🧹 Cleaning &amp; Hygiene</span></td>
                    <td style={{ fontWeight: 600 }}>Liquid Handwash</td>
                    <td><code>brand</code>, <code>pack_size</code></td>
                    <td>Dettol - 500ml Pump, Lifebuoy - 5L Refill Can</td>
                    <td>bottles / cans</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: MANDATORY VS OPTIONAL RULES & FAQ ================= */}
      {activeTab === "rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "var(--text-primary)" }}>
              ✅ Data Entry Rules: Mandatory vs Optional
            </h2>

            <div className="grid-responsive-2" style={{ gap: 16 }}>
              {/* Mandatory */}
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: 20,
                border: "1px solid rgba(248,113,113,0.3)"
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#f87171", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={16} /> MANDATORY FIELDS (Must be provided)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Stock Usage Quantity:</strong> Must be a whole number &gt; 0 and cannot exceed live available stock.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Specific Variant:</strong> Always choose the exact variant (e.g. <em>White - A1</em>) rather than leaving blank.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Category Name &amp; Item Unit:</strong> Required when setting up items (e.g. <em>sheets</em>, <em>boxes</em>, <em>pcs</em>).
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Hiring Phone Number:</strong> Must be exactly 10 digits starting with 6, 7, 8, or 9 (no letters or strings allowed).
                  </div>
                </div>
              </div>

              {/* Optional */}
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: 20,
                border: "1px solid rgba(108,143,255,0.3)"
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--accent-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Info size={16} /> RECOMMENDED / OPTIONAL FIELDS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Event / Celebration Tag:</strong> Optional for daily routine, but <em>strongly recommended</em> for special celebrations so costs can be reported.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Classroom Purpose / Notes:</strong> Helpful for accountability (e.g., <em>&quot;UKG Rhyme chart&quot;</em> or <em>&quot;Teacher lounge supply&quot;</em>).
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Candidate Experience &amp; Expected Salary:</strong> Helpful to negotiate and compare candidates.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Low Stock Alert Threshold:</strong> Defaults to 5 if left blank.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Cards */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <HelpCircle size={18} color="var(--accent-primary)" /> Frequently Asked Questions
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-secondary)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                  Q: What happens if a teacher takes more stock than recorded in the system?
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  The system prevents negative inventory with the warning <em>&quot;Cannot use more than current stock&quot;</em>. If the physical cupboard has supplies not yet logged in the app, the School Head or Teacher should first tap <strong>➕ Add Stock</strong> to match reality, then log the usage.
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-secondary)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                  Q: Can teachers view admin instructions and the Hiring page?
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Yes! All instruction guides are open so teachers understand the master setup and hiring process. The live candidate caller records in the Hiring tab are restricted to Administrators to keep applicant phone numbers and salaries confidential.
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-secondary)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                  Q: Where does all this data get saved?
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Every transaction immediately synchronizes with your school&apos;s <strong>Google Sheets</strong> database. Even if you switch devices or log out, your Google Sheet keeps all history, columns, and timestamps securely stored in your Google Drive.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
