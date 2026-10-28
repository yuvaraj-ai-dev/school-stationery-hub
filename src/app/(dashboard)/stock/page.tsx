"use client";
import { useEffect, useState } from "react";
import { ItemVariant, Item, Category } from "@/types";
import { getStockStatusColor, getStockStatusText, getStockStatusDot, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";
import { Search, Plus, ArrowUp, ArrowDown, Edit2, Trash2, ChevronDown, ChevronRight, X } from "lucide-react";

interface GroupedItem {
  item: Item;
  category: Category;
  variants: ItemVariant[];
  totalStock: number;
}

export default function StockPage() {
  const [variants, setVariants] = useState<ItemVariant[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: "add" | "use"; variant: ItemVariant; item: Item } | null>(null);
  const [role, setRole] = useState("teacher");
  const [txForm, setTxForm] = useState({ quantity: "", event: "", notes: "" });
  const [txLoading, setTxLoading] = useState(false);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchAll();
    // Get role from session
    fetch("/api/auth/session").then(r => r.json()).then(s => setRole(s?.user?.role || "teacher"));
    fetch("/api/events").then(r => r.json()).then(setEvents).catch(() => { });
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [v, i, c] = await Promise.all([
        fetch("/api/variants").then(r => r.json()),
        fetch("/api/items").then(r => r.json()),
        fetch("/api/categories").then(r => r.json()),
      ]);
      setVariants(Array.isArray(v) ? v : []);
      setItems(Array.isArray(i) ? i : []);
      setCategories(Array.isArray(c) ? c : []);
    } catch { toast.error("Failed to load stock data"); }
    setLoading(false);
  }

  // Group variants by item
  const grouped: GroupedItem[] = items.map(item => {
    const itemVariants = variants.filter(v => v.item_id === item.id);
    const category = categories.find(c => c.id === item.category_id) || { id: "", name: "Unknown", description: "", icon: "📦", created_at: "" };
    return {
      item,
      category,
      variants: itemVariants,
      totalStock: itemVariants.reduce((s, v) => s + v.current_stock, 0),
    };
  }).filter(g => {
    const matchSearch = g.item.name.toLowerCase().includes(search.toLowerCase()) ||
      g.variants.some(v => v.variant_label.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === "all" || g.item.category_id === filterCat;
    return matchSearch && matchCat;
  });

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  async function handleTransaction() {
    if (!modal) return;
    if (!txForm.quantity || Number(txForm.quantity) <= 0) {
      toast.error("Enter a valid quantity"); return;
    }
    setTxLoading(true);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: modal.variant.id,
          item_id: modal.item.id,
          item_name: modal.item.name,
          variant_label: modal.variant.variant_label,
          action_type: modal.type,
          quantity: Number(txForm.quantity),
          event: txForm.event,
          notes: txForm.notes,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(modal.type === "add" ? "Stock added ✅" : "Usage logged ✅");
      setModal(null);
      setTxForm({ quantity: "", event: "", notes: "" });
      fetchAll();
    } catch { toast.error("Transaction failed"); }
    setTxLoading(false);
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            📦 Stock Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>View and manage all stationery items and their variants</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Search items or variants..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={`chip ${filterCat === "all" ? "active" : ""}`} onClick={() => setFilterCat("all")}>All Categories</button>
          {categories.map(c => (
            <button key={c.id} className={`chip ${filterCat === c.id ? "active" : ""}`} onClick={() => setFilterCat(c.id)}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : grouped.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">No items found</div>
          <div className="empty-state-desc">Add items from the Items page first.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {grouped.map(({ item, category, variants: itemVariants, totalStock }) => {
            const isExpanded = expandedItems.has(item.id);
            const hasLow = itemVariants.some(v => v.current_stock > 0 && v.current_stock <= v.min_threshold);
            const hasOut = itemVariants.some(v => v.current_stock === 0);

            return (
              <div key={item.id} className="glass-card">
                {/* Item header */}
                <div
                  style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                  onClick={() => toggleExpand(item.id)}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, background: "var(--bg-secondary)",
                    border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {category.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{item.name}</span>
                      <span className="tag tag-blue">{category.name}</span>
                      {hasOut && <span className="tag tag-red">Out of Stock</span>}
                      {!hasOut && hasLow && <span className="tag tag-amber">Low Stock</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                      {itemVariants.length} variant{itemVariants.length !== 1 ? "s" : ""} · Total: {totalStock} {item.unit}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {/* Variants view: Desktop Table + Mobile Cards */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "12px 14px 16px" }}>
                    {itemVariants.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "16px 0", color: "var(--text-muted)", fontSize: 13 }}>No variants yet</div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="desktop-table table-responsive">
                          <table className="data-table" style={{ marginTop: 4, minWidth: 620 }}>
                            <thead>
                              <tr>
                                <th>Variant</th>
                                <th>Color</th>
                                <th>Size</th>
                                <th>Type/Grade</th>
                                <th>Brand</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {itemVariants.map(variant => {
                                const statusColor = getStockStatusColor(variant.current_stock, variant.min_threshold);
                                const statusText = getStockStatusText(variant.current_stock, variant.min_threshold);
                                const dotColor = getStockStatusDot(variant.current_stock, variant.min_threshold);
                                const pct = variant.min_threshold > 0
                                  ? Math.min(100, (variant.current_stock / (variant.min_threshold * 3)) * 100) : 100;

                                return (
                                  <tr key={variant.id}>
                                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{variant.variant_label}</td>
                                    <td>{variant.color || "-"}</td>
                                    <td>{variant.size || "-"}</td>
                                    <td>{variant.type || variant.grade || "-"}</td>
                                    <td>{variant.brand || "-"}</td>
                                    <td>
                                      <div style={{ minWidth: 80 }}>
                                        <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                                          {variant.current_stock} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>{item.unit}</span>
                                        </div>
                                        <div className="stock-bar" style={{ width: 80 }}>
                                          <div className="stock-bar-fill" style={{
                                            width: `${pct}%`,
                                            background: variant.current_stock === 0 ? "#f87171" : variant.current_stock <= variant.min_threshold ? "#fbbf24" : "var(--gradient-1)",
                                          }} />
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className={`stat-badge ${variant.current_stock === 0 ? "out" : variant.current_stock <= variant.min_threshold ? "low" : "good"}`}>
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                                        {statusText}
                                      </span>
                                    </td>
                                    <td>
                                      <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                          className="btn-success"
                                          style={{ padding: "6px 12px", fontSize: 12 }}
                                          onClick={() => { setModal({ type: "add", variant, item }); setTxForm({ quantity: "", event: "", notes: "" }); }}
                                        >
                                          <ArrowUp size={13} /> Add
                                        </button>
                                        <button
                                          className="btn-warning"
                                          style={{ padding: "6px 12px", fontSize: 12 }}
                                          onClick={() => { setModal({ type: "use", variant, item }); setTxForm({ quantity: "", event: "", notes: "" }); }}
                                        >
                                          <ArrowDown size={13} /> Use
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Vertical Cards View */}
                        <div className="mobile-card-list">
                          {itemVariants.map(variant => {
                            const statusText = getStockStatusText(variant.current_stock, variant.min_threshold);
                            return (
                              <div
                                key={variant.id}
                                style={{
                                  background: "var(--bg-secondary)",
                                  border: "1px solid var(--border)",
                                  borderRadius: 14,
                                  padding: "14px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 10 }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                                      {variant.variant_label}
                                    </div>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, fontSize: 12, color: "var(--text-muted)" }}>
                                      {variant.color && <span>Color: <strong style={{ color: "var(--text-secondary)" }}>{variant.color}</strong></span>}
                                      {variant.size && <span>• Size: <strong style={{ color: "var(--text-secondary)" }}>{variant.size}</strong></span>}
                                      {(variant.type || variant.grade) && <span>• {variant.type || variant.grade}</span>}
                                      {variant.brand && <span>• Brand: <strong style={{ color: "var(--text-secondary)" }}>{variant.brand}</strong></span>}
                                    </div>
                                  </div>
                                  <span className={`stat-badge ${variant.current_stock === 0 ? "out" : variant.current_stock <= variant.min_threshold ? "low" : "good"}`} style={{ flexShrink: 0 }}>
                                    {statusText}
                                  </span>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                                    Current Stock: <span style={{ color: variant.current_stock === 0 ? "var(--accent-red)" : variant.current_stock <= variant.min_threshold ? "var(--accent-amber)" : "var(--accent-emerald)" }}>{variant.current_stock} {item.unit}</span>
                                  </div>
                                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                    Alert: &lt;{variant.min_threshold}
                                  </div>
                                </div>

                                {/* Touch action buttons */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                  <button
                                    className="btn-success"
                                    style={{ padding: "10px", fontSize: 13, fontWeight: 600, justifyContent: "center", minHeight: 42 }}
                                    onClick={() => { setModal({ type: "add", variant, item }); setTxForm({ quantity: "", event: "", notes: "" }); }}
                                  >
                                    <ArrowUp size={15} /> Add Stock
                                  </button>
                                  <button
                                    className="btn-warning"
                                    style={{ padding: "10px", fontSize: 13, fontWeight: 600, justifyContent: "center", minHeight: 42 }}
                                    onClick={() => { setModal({ type: "use", variant, item }); setTxForm({ quantity: "", event: "", notes: "" }); }}
                                  >
                                    <ArrowDown size={15} /> Use Stock
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700 }}>
                  {modal.type === "add" ? "➕ Add Stock" : "📤 Log Usage"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
                  {modal.item.name} · <strong style={{ color: "var(--text-secondary)" }}>{modal.variant.variant_label}</strong>
                </p>
              </div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                padding: "12px 16px", borderRadius: 10,
                background: modal.type === "add" ? "rgba(52,211,153,0.06)" : "rgba(251,191,36,0.06)",
                border: modal.type === "add" ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(251,191,36,0.2)",
                fontSize: 13, color: "var(--text-secondary)",
              }}>
                Current Stock: <strong style={{ color: "var(--text-primary)" }}>{modal.variant.current_stock} {modal.item.unit}</strong>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="input-base"
                  placeholder={`How many ${modal.item.unit}?`}
                  value={txForm.quantity}
                  onChange={e => setTxForm(f => ({ ...f, quantity: e.target.value }))}
                  min={1}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event / Occasion (optional)</label>
                <select
                  className="input-base"
                  value={txForm.event}
                  onChange={e => setTxForm(f => ({ ...f, event: e.target.value }))}
                >
                  <option value="">— None —</option>
                  {events.map(ev => <option key={ev.id} value={ev.name}>{ev.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input
                  className="input-base"
                  placeholder="e.g., Used for drawing activity..."
                  value={txForm.notes}
                  onChange={e => setTxForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12, paddingBottom: 8 }}>
                <button className="btn-secondary" onClick={() => setModal(null)} style={{ flex: 1, minHeight: 44, justifyContent: "center" }}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={handleTransaction}
                  disabled={txLoading}
                  style={{ flex: 2, minHeight: 44, justifyContent: "center" }}
                >
                  {txLoading ? <div className="spinner" /> : modal.type === "add" ? "Add Stock" : "Log Usage"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
