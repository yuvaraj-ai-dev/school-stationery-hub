"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen, CheckCircle2, AlertTriangle, Shield, UserCheck,
  Package, ArrowDown, ArrowUp, Calendar, Tag, Layers, HelpCircle,
  Sparkles, FileText, Check, AlertCircle, Info
} from "lucide-react";

export default function InstructionsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [activeTab, setActiveTab] = useState<"teacher" | "admin" | "matrix" | "rules">("teacher");

  useEffect(() => {
    if (isAdmin) {
      setActiveTab("admin");
    }
  }, [isAdmin]);

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: "28px 32px",
        marginBottom: 24,
        background: "linear-gradient(135deg, rgba(108,143,255,0.12) 0%, rgba(167,139,250,0.08) 100%)",
        border: "1px solid rgba(108,143,255,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>📖</span>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                Stationery Management Guide & SOP
              </h1>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 680, lineHeight: 1.6 }}>
              Standard operating procedures for preschool teachers and school administration. Learn how to log daily classroom usage, manage stock refills, and set up dynamic stationery variants.
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

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <button
            className={`chip ${activeTab === "teacher" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600 }}
            onClick={() => setActiveTab("teacher")}
          >
            👩‍🏫 Teacher Guide (Daily Usage)
          </button>
          <button
            className={`chip ${activeTab === "admin" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600 }}
            onClick={() => setActiveTab("admin")}
          >
            🔑 Admin Guide (Master Setup)
          </button>
          <button
            className={`chip ${activeTab === "matrix" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600 }}
            onClick={() => setActiveTab("matrix")}
          >
            🎨 Category & Variant Cheat Sheet
          </button>
          <button
            className={`chip ${activeTab === "rules" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600 }}
            onClick={() => setActiveTab("rules")}
          >
            ✅ Mandatory Fields & FAQ
          </button>
        </div>
      </div>

      {/* ================= TAB 1: TEACHER GUIDE (DAILY USAGE) ================= */}
      {activeTab === "teacher" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Important Notice */}
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
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent-amber)", marginBottom: 4 }}>
                Key Rule for Teachers: Regular Daily Usage Updates
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                New stock arrives only <strong>once a month or per term</strong>, but <strong>Usage must be updated immediately</strong> whenever you collect materials for your class or an event. This ensures the live stock count is accurate and prevents other teachers from finding empty boxes.
              </div>
            </div>
          </div>

          {/* Step-by-Step Usage Flow */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <ArrowDown size={20} color="#f87171" />
              How to Log Stock Usage (When taking stationery)
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 20 }}>
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: 18,
                border: "1px solid var(--border)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "var(--gradient-1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12,
                }}>
                  1
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "var(--text-primary)" }}>
                  Open Stock Management
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Go to <strong>Stock</strong> in the sidebar. Click the blue <strong>&quot;Log Stock Action&quot;</strong> button at the top right.
                </div>
              </div>

              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: 18,
                border: "1px solid var(--border)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "rgba(248,113,113,0.2)",
                  color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, marginBottom: 12,
                }}>
                  2
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "var(--text-primary)" }}>
                  Select &quot;Use / Dispense&quot;
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Under Action Type, click <strong>📤 Use / Dispense Stock</strong>. The modal will adjust to deduction mode.
                </div>
              </div>

              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: 18,
                border: "1px solid var(--border)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "var(--gradient-1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12,
                }}>
                  3
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "var(--text-primary)" }}>
                  Select Exact Variant
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Pick the exact item and color/size variant (e.g., <em>Chart Paper — White - Full Sheet</em>). The modal shows current available count.
                </div>
              </div>

              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: 18,
                border: "1px solid var(--border)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "rgba(52,211,153,0.2)",
                  color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, marginBottom: 12,
                }}>
                  4
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "var(--text-primary)" }}>
                  Enter Quantity & Event Tag
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Enter how many units you took. Tag the <strong>Event / Celebration</strong> (if applicable) and write a short reason in <strong>Notes</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* Concrete Teacher Example Box */}
          <div className="glass-card" style={{ padding: 24, borderLeft: "4px solid var(--accent-primary)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              Real Example: Taking materials for LKG Activity
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              Suppose you are preparing for <strong>&quot;Fruit Day Coloring Activity&quot;</strong> and taking 12 sheets of yellow chart paper and 2 glue sticks:
            </p>
            <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 16, fontSize: 13, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>🔹 <strong>Transaction 1:</strong> Variant: <code>Chart Paper — Yellow - Full Sheet</code> | Quantity: <code>12</code> | Event: <code>Fruit Day Celebration</code> | Notes: <code>LKG Banana & Mango cutouts</code></div>
              <div>🔹 <strong>Transaction 2:</strong> Variant: <code>Child-safe Glue Stick — 15g</code> | Quantity: <code>2</code> | Event: <code>Fruit Day Celebration</code> | Notes: <code>Classroom supply for Mrs. Anjali</code></div>
            </div>
          </div>

          {/* Teacher Permissions */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>
              🔒 Teacher Access Permissions (What you can and cannot do)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 10, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-emerald)", fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Check size={16} /> What Teachers CAN Do:
                </div>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  <li>View live stock counts of all stationery & colors</li>
                  <li>Log stock usage whenever collecting items</li>
                  <li>Record incoming stock when receiving supplies</li>
                  <li>Create and view Events & Celebrations</li>
                  <li>View your own past usage history & logs</li>
                </ul>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <div style={{ fontWeight: 700, color: "#f87171", fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={16} /> What Teachers CANNOT Do:
                </div>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  <li>Delete items, variants, or categories (Admin only)</li>
                  <li>Delete historical stock logs or transactions</li>
                  <li>Access user role management in Settings</li>
                  <li>Accidentally wipe out inventory data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ADMIN GUIDE (MASTER SETUP) ================= */}
      {activeTab === "admin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
              🔑 School Head / Admin Setup Workflow
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
              As the administrator, you are responsible for the initial catalog setup and periodic inventory reviews. Follow this hierarchy when configuring the app:
            </p>

            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
              background: "var(--bg-secondary)", borderRadius: 12, marginBottom: 24,
              overflowX: "auto"
            }}>
              <span className="tag tag-blue" style={{ fontSize: 13, padding: "6px 12px" }}>1. Categories</span>
              <span style={{ color: "var(--text-muted)" }}>➜</span>
              <span className="tag tag-purple" style={{ fontSize: 13, padding: "6px 12px" }}>2. Parent Items & Attributes</span>
              <span style={{ color: "var(--text-muted)" }}>➜</span>
              <span className="tag tag-green" style={{ fontSize: 13, padding: "6px 12px" }}>3. Color/Size Variants</span>
              <span style={{ color: "var(--text-muted)" }}>➜</span>
              <span className="tag tag-amber" style={{ fontSize: 13, padding: "6px 12px" }}>4. Initial Stock Baseline</span>
            </div>

            {/* Detailed Admin Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Step 1 */}
              <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Tag size={18} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Step 1: Create Categories</h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                  Categories are high-level groupings. A preschool generally needs 5 main categories:
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="tag tag-blue">📄 Paper & Chart Materials</span>
                  <span className="tag tag-purple">🖍️ Drawing & Coloring Supplies</span>
                  <span className="tag tag-pink">🎨 Art & Craft Materials</span>
                  <span className="tag tag-amber">📒 General Stationery</span>
                  <span className="tag tag-green">🧹 Cleaning & Hygiene Consumables</span>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Layers size={18} color="var(--accent-purple)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Step 2: Create Parent Items & Pick Variant Attributes</h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                  When creating an item (e.g. <em>Chart Paper</em>), you toggle which attributes matter for that item.
                </p>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  • If you choose <strong>Color</strong> and <strong>Size</strong>, the app will generate variants like <em>White - A1</em>, <em>Red - A1</em>.<br />
                  • If it&apos;s a single uniform item like a <em>Heavy-duty Stapler</em>, you can leave attributes blank or choose <strong>Type</strong> only.
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Package size={18} color="var(--accent-emerald)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Step 3: Add Variants with Initial Stock & Minimum Threshold</h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                  For each variant, set the <strong>Initial Stock</strong> and <strong>Min Alert Threshold</strong>:
                </p>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  • <strong>Min Alert Threshold:</strong> When stock drops to or below this number, the dashboard highlights it in amber/red alert so you can re-order in time. Recommended threshold: <code>5 to 10 units</code> for papers, <code>2 units</code> for tools/staplers.
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Calendar size={18} color="var(--accent-pink)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Step 4: Create Events in Advance</h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                  Set up your academic calendar events (e.g. <em>Sports Day 2026</em>, <em>Grandparents Day</em>, <em>Independence Day Craft</em>) in <strong>Events</strong> before activities begin.
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  This allows teachers to select the event from the dropdown with one click when taking materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CATEGORY & VARIANT CHEAT SHEET ================= */}
      {activeTab === "matrix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
              🎨 Recommended Variant Attributes by Category
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
              Use this reference guide when adding new items so that every category is organized logically.
            </p>

            <table className="data-table">
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
                  <td><span className="tag tag-blue">📄 Paper & Chart</span></td>
                  <td style={{ fontWeight: 600 }}>Chart Paper</td>
                  <td><code>color</code>, <code>size</code></td>
                  <td>White - Full Sheet, Yellow - Full Sheet, Light Blue - Full Sheet</td>
                  <td>sheets</td>
                </tr>
                <tr>
                  <td><span className="tag tag-blue">📄 Paper & Chart</span></td>
                  <td style={{ fontWeight: 600 }}>Colored Craft Paper</td>
                  <td><code>color</code>, <code>size</code></td>
                  <td>Assorted Colors - A4, Pastel Green - A4, Neon Pink - A4</td>
                  <td>reams / packs</td>
                </tr>
                <tr>
                  <td><span className="tag tag-purple">🖍️ Drawing & Color</span></td>
                  <td style={{ fontWeight: 600 }}>Wax Crayons</td>
                  <td><code>brand</code>, <code>pack_size</code></td>
                  <td>Camlin - 12 Shades, Faber-Castell - 24 Shades Jumbo</td>
                  <td>boxes</td>
                </tr>
                <tr>
                  <td><span className="tag tag-purple">🖍️ Drawing & Color</span></td>
                  <td style={{ fontWeight: 600 }}>Poster Colors</td>
                  <td><code>color</code>, <code>pack_size</code></td>
                  <td>Red - 100ml, Royal Blue - 100ml, 12 Shades Set</td>
                  <td>bottles / sets</td>
                </tr>
                <tr>
                  <td><span className="tag tag-pink">🎨 Art & Craft</span></td>
                  <td style={{ fontWeight: 600 }}>EVA Foam Sheets</td>
                  <td><code>color</code>, <code>type</code>, <code>size</code></td>
                  <td>Glitter Gold - Self-Adhesive - A4, Plain Multi - A4</td>
                  <td>sheets</td>
                </tr>
                <tr>
                  <td><span className="tag tag-pink">🎨 Art & Craft</span></td>
                  <td style={{ fontWeight: 600 }}>Ice-Cream Sticks</td>
                  <td><code>type</code>, <code>pack_size</code></td>
                  <td>Plain Natural - 100pcs, Multi-Colored - 100pcs</td>
                  <td>packets</td>
                </tr>
                <tr>
                  <td><span className="tag tag-pink">🎨 Art & Craft</span></td>
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
                  <td><span className="tag tag-green">🧹 Cleaning & Hygiene</span></td>
                  <td style={{ fontWeight: 600 }}>Liquid Handwash</td>
                  <td><code>brand</code>, <code>pack_size</code></td>
                  <td>Dettol - 500ml Pump, Lifebuoy - 5L Refill Can</td>
                  <td>bottles / cans</td>
                </tr>
                <tr>
                  <td><span className="tag tag-green">🧹 Cleaning & Hygiene</span></td>
                  <td style={{ fontWeight: 600 }}>Tissue Paper Box</td>
                  <td><code>pack_size</code></td>
                  <td>100 Pulls 2-Ply, 200 Pulls Soft Box</td>
                  <td>boxes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: MANDATORY VS OPTIONAL RULES & FAQ ================= */}
      {activeTab === "rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>
              ✅ Data Entry Rules: Mandatory vs Optional
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Mandatory */}
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: 20,
                border: "1px solid rgba(248,113,113,0.3)"
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#f87171", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={16} /> MANDATORY FIELDS (Must be filled)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Action Type:</strong> Must select either <code>Add</code> or <code>Use</code>.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Item & Variant:</strong> You must select the specific variant. Never leave as unselected.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Quantity:</strong> Must be a positive whole number greater than 0. Cannot exceed available stock when using.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Category Name & Item Name:</strong> Required when creating new records.
                  </div>
                </div>
              </div>

              {/* Optional / Recommended */}
              <div style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: 20,
                border: "1px solid rgba(108,143,255,0.3)"
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Info size={16} /> RECOMMENDED / OPTIONAL FIELDS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Event / Celebration:</strong> Optional for regular daily classroom use, but <em>strongly recommended</em> for special celebrations so costs can be reported.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Purpose / Notes:</strong> Helpful for accountability (e.g., &quot;UKG Rhyme chart&quot; or &quot;Teacher lounge supply&quot;).
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Category Description:</strong> Helpful for onboarding new staff members.
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <strong>Low Stock Alert Threshold:</strong> Defaults to 5 if left blank.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Accordion / Cards */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <HelpCircle size={18} color="var(--accent-primary)" /> Frequently Asked Questions
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-secondary)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                  Q: What happens if a teacher takes more stock than recorded in the system?
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  The system prevents negative stock and will show an alert (&quot;Cannot use more than current stock&quot;). If the physical shelf has items not logged in the app, the School Head or Teacher should first do a <strong>➕ Add Stock</strong> transaction to match reality, then log the usage.
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-secondary)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                  Q: Can teachers see other teachers&apos; stock logs?
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  In the Usage Logs tab, teachers can see the full transparent audit trail of what was taken and for which event, helping staff coordinate so materials are not duplicated. Only School Heads (Admins) can delete or re-assign user permissions.
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-secondary)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                  Q: Where does all this data get saved?
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Every update instantly synchronizes with your school&apos;s <strong>Google Sheets</strong> database. Even if you leave the app, the Google Sheet maintains all columns, timestamps, and history safely in your Google Drive.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

