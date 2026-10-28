"use client";
import { useEffect, useState } from "react";
import { ItemVariant, Item, Category } from "@/types";
import { getStockStatusColor, getStockStatusText, getStockStatusDot, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";
import { Search, Plus, Minus, ArrowUp, ArrowDown, Edit2, Trash2, ChevronDown, ChevronRight, X, ShoppingCart, Check, Sparkles } from "lucide-react";

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

  // Bulk usage modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkEvent, setBulkEvent] = useState("");
  const [bulkNotes, setBulkNotes] = useState("");
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkCategory, setBulkCategory] = useState("all");
  const [bulkTab, setBulkTab] = useState<"catalog" | "selected">("catalog");
  const [selectedUsage, setSelectedUsage] = useState<Record<string, number>>({});
  const [bulkLoading, setBulkLoading] = useState(false);

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

  // ─── Bulk & Quick Usage Functions ──────────────────────────────────────────
  function openBulkModal() {
    setBulkEvent("");
    setBulkNotes("");
    setBulkSearch("");
    setBulkCategory(filterCat !== "all" ? filterCat : "all");
    setBulkTab("catalog");
    setSelectedUsage({});
    setBulkModalOpen(true);
  }

  function handleAddOrIncrement(variantId: string, maxStock: number) {
    if (maxStock <= 0) {
      toast.error("Item is out of stock");
      return;
    }
    setSelectedUsage(prev => {
      const cur = prev[variantId] || 0;
      if (cur >= maxStock) {
        toast.error(`Cannot exceed in-stock quantity (${maxStock})`);
        return prev;
      }
      return { ...prev, [variantId]: cur + 1 };
    });
  }

  function handleDecrement(variantId: string) {
    setSelectedUsage(prev => {
      const cur = prev[variantId] || 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[variantId];
        return next;
      }
      return { ...prev, [variantId]: cur - 1 };
    });
  }

  function handleDirectQtyChange(variantId: string, value: string, maxStock: number) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      setSelectedUsage(prev => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
      return;
    }
    const clamped = Math.min(maxStock, num);
    if (num > maxStock) {
      toast.error(`Clamped to available stock (${maxStock})`);
    }
    setSelectedUsage(prev => ({ ...prev, [variantId]: clamped }));
  }

  function handleRemoveItem(variantId: string) {
    setSelectedUsage(prev => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  }

  async function handleBulkSubmit() {
    const selectedEntries = Object.entries(selectedUsage).filter(([_, qty]) => qty > 0);
    if (selectedEntries.length === 0) {
      toast.error("Please select at least one material to log usage");
      return;
    }

    // Pre-validate all items
    for (const [variantId, qty] of selectedEntries) {
      const v = variants.find(variant => variant.id === variantId);
      if (!v) {
        toast.error("Variant not found");
        return;
      }
      if (qty > v.current_stock) {
        toast.error(`${v.variant_label}: Quantity (${qty}) exceeds available stock (${v.current_stock})`);
        return;
      }
    }

    setBulkLoading(true);
    try {
      const payloadItems = selectedEntries.map(([variantId, qty]) => {
        const variant = variants.find(v => v.id === variantId)!;
        const item = items.find(i => i.id === variant.item_id);
        return {
          variant_id: variantId,
          item_id: variant.item_id,
          item_name: item?.name || "",
          variant_label: variant.variant_label,
          action_type: "use",
          quantity: qty,
        };
      });

      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: bulkEvent,
          notes: bulkNotes,
          items: payloadItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log bulk usage");

      toast.success(`🎉 Successfully logged usage for ${payloadItems.length} materials!`);
      setBulkModalOpen(false);
      setSelectedUsage({});
      fetchAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit bulk usage");
    } finally {
      setBulkLoading(false);
    }
  }

  // Pre-compute flattened materials for fast search and display in modal
  const allMaterialVariants = variants.map(v => {
    const item = items.find(i => i.id === v.item_id);
    const category = categories.find(c => c.id === item?.category_id);
    return {
      variant: v,
      item: item || { id: v.item_id, name: "Unknown Item", unit: "units", category_id: "" },
      category: category || { id: "", name: "General", icon: "📦" },
    };
  });

  const filteredMaterialVariants = allMaterialVariants.filter(m => {
    const matchCat = bulkCategory === "all" || m.item.category_id === bulkCategory;
    const q = bulkSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      m.item.name.toLowerCase().includes(q) ||
      m.variant.variant_label.toLowerCase().includes(q) ||
      (m.variant.color && m.variant.color.toLowerCase().includes(q)) ||
      (m.category.name && m.category.name.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const selectedVariantsList = allMaterialVariants.filter(m => (selectedUsage[m.variant.id] || 0) > 0);
  const selectedCount = selectedVariantsList.length;
  const totalUnits = selectedVariantsList.reduce((acc, m) => acc + (selectedUsage[m.variant.id] || 0), 0);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            📦 Stock Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>View and manage all stationery items and their variants</p>
        </div>
        <button
          className="btn-primary"
          onClick={openBulkModal}
          style={{ minHeight: 42, padding: "9px 18px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
        >
          <ArrowDown size={16} /> Bulk Log Usage
        </button>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>Quantity * ({modal.item.unit})</label>
                  {modal.type === "use" && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Max: {modal.variant.current_stock}
                    </span>
                  )}
                </div>

                {/* Touch Stepper */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => {
                      const cur = Number(txForm.quantity) || 1;
                      if (cur > 1) setTxForm(f => ({ ...f, quantity: String(cur - 1) }));
                    }}
                    title="Minus 1"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    className="input-base"
                    style={{ textAlign: "center", fontSize: 18, fontWeight: 700, flex: 1, height: 44, margin: 0 }}
                    placeholder="1"
                    value={txForm.quantity}
                    onChange={e => setTxForm(f => ({ ...f, quantity: e.target.value }))}
                    min={1}
                    max={modal.type === "use" ? modal.variant.current_stock : undefined}
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    disabled={modal.type === "use" && Number(txForm.quantity) >= modal.variant.current_stock}
                    onClick={() => {
                      const cur = Number(txForm.quantity) || 0;
                      if (modal.type === "use" && cur >= modal.variant.current_stock) return;
                      setTxForm(f => ({ ...f, quantity: String(cur + 1) }));
                    }}
                    title="Plus 1"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Quick Chips for easy thumb tap */}
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {[1, 2, 5, 10].map(n => {
                    const disabled = modal.type === "use" && n > modal.variant.current_stock;
                    return (
                      <button
                        key={n}
                        type="button"
                        disabled={disabled}
                        className="quick-qty-chip"
                        onClick={() => setTxForm(f => ({ ...f, quantity: String(n) }))}
                      >
                        +{n} {modal.item.unit}
                      </button>
                    );
                  })}
                  {modal.type === "use" && modal.variant.current_stock > 0 && (
                    <button
                      type="button"
                      className="quick-qty-chip"
                      style={{ borderColor: "rgba(251,191,36,0.4)", color: "var(--accent-amber)" }}
                      onClick={() => setTxForm(f => ({ ...f, quantity: String(modal.variant.current_stock) }))}
                    >
                      All ({modal.variant.current_stock})
                    </button>
                  )}
                </div>

                {/* Calculation preview */}
                {modal.type === "use" && Number(txForm.quantity) > 0 && (
                  <div style={{ fontSize: 12, marginTop: 8, color: Number(txForm.quantity) > modal.variant.current_stock ? "var(--accent-red)" : "var(--accent-emerald)" }}>
                    {Number(txForm.quantity) > modal.variant.current_stock
                      ? `⚠️ Quantity exceeds available stock (${modal.variant.current_stock})`
                      : `Remaining stock after: ${modal.variant.current_stock - Number(txForm.quantity)} ${modal.item.unit}`}
                  </div>
                )}
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

      {/* ─── Bulk & Quick Usage Modal ────────────────────────────────────── */}
      {bulkModalOpen && (
        <div className="modal-overlay" onClick={() => setBulkModalOpen(false)}>
          <div
            className="bulk-modal-box"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(108,143,255,0.12)",
                  color: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}>
                  📤
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                    Quick Stock Usage
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
                    Tap + to pick items for class activity
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 8 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Event & Shared Notes Bar */}
            <div style={{
              padding: "12px 18px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10,
            }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  🎉 Event / Occasion (optional)
                </label>
                <select
                  className="input-base"
                  style={{ fontSize: 13, padding: "8px 12px", minHeight: 38 }}
                  value={bulkEvent}
                  onChange={e => setBulkEvent(e.target.value)}
                >
                  <option value="">— Daily Classroom / Routine Use —</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.name}>{ev.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  📝 Classroom Purpose / Notes (optional)
                </label>
                <input
                  className="input-base"
                  style={{ fontSize: 13, padding: "8px 12px", minHeight: 38 }}
                  placeholder="e.g. LKG morning drawing..."
                  value={bulkNotes}
                  onChange={e => setBulkNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{
              display: "flex",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-card)",
              padding: "6px 14px 0",
              gap: 8,
            }}>
              <button
                type="button"
                onClick={() => setBulkTab("catalog")}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  background: "none",
                  borderBottom: bulkTab === "catalog" ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  color: bulkTab === "catalog" ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span>📦 Browse All ({filteredMaterialVariants.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setBulkTab("selected")}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  background: "none",
                  borderBottom: bulkTab === "selected" ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  color: bulkTab === "selected" ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🛒 Selected</span>
                  <span style={{
                    padding: "1px 8px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    background: selectedCount > 0 ? "var(--accent-emerald)" : "var(--border)",
                    color: selectedCount > 0 ? "#0a0f1e" : "var(--text-muted)",
                  }}>
                    {selectedCount}
                  </span>
                </div>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {bulkTab === "catalog" ? (
                <>
                  {/* Search and Category Filter */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="search-bar" style={{ width: "100%" }}>
                      <Search size={15} />
                      <input
                        placeholder="Search stationery (e.g. chart, crayon, glue)..."
                        value={bulkSearch}
                        onChange={e => setBulkSearch(e.target.value)}
                        style={{ fontSize: 13 }}
                      />
                      {bulkSearch && (
                        <button
                          type="button"
                          onClick={() => setBulkSearch("")}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                      <button
                        type="button"
                        className={`chip ${bulkCategory === "all" ? "active" : ""}`}
                        style={{ fontSize: 12, padding: "4px 10px", whiteSpace: "nowrap" }}
                        onClick={() => setBulkCategory("all")}
                      >
                        All Categories
                      </button>
                      {categories.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          className={`chip ${bulkCategory === c.id ? "active" : ""}`}
                          style={{ fontSize: 12, padding: "4px 10px", whiteSpace: "nowrap" }}
                          onClick={() => setBulkCategory(c.id)}
                        >
                          {c.icon} {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Materials List */}
                  {filteredMaterialVariants.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>No materials found</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>Try clearing search or choosing another category</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {filteredMaterialVariants.map(m => {
                        const qty = selectedUsage[m.variant.id] || 0;
                        const isSelected = qty > 0;
                        const isOut = m.variant.current_stock <= 0;
                        const isLow = !isOut && m.variant.current_stock <= m.variant.min_threshold;

                        return (
                          <div
                            key={m.variant.id}
                            style={{
                              padding: "12px 14px",
                              borderRadius: 14,
                              background: isSelected ? "rgba(108,143,255,0.06)" : "var(--bg-secondary)",
                              border: isSelected ? "1px solid rgba(108,143,255,0.3)" : "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            {/* Left: Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                                  {m.item.name}
                                </span>
                                <span style={{
                                  fontSize: 11,
                                  padding: "2px 7px",
                                  borderRadius: 6,
                                  background: "var(--bg-card)",
                                  border: "1px solid var(--border-light)",
                                  color: "var(--text-secondary)",
                                }}>
                                  {m.variant.variant_label}
                                </span>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap", fontSize: 12 }}>
                                <span style={{ color: isOut ? "var(--accent-red)" : isLow ? "var(--accent-amber)" : "var(--accent-emerald)", fontWeight: 600 }}>
                                  {isOut ? "Out of stock" : `${m.variant.current_stock} ${m.item.unit} in stock`}
                                </span>
                                {isSelected && (
                                  <span style={{ color: "var(--text-muted)" }}>
                                    · Remaining: {m.variant.current_stock - qty} {m.item.unit}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right: Action or Stepper */}
                            <div>
                              {isOut ? (
                                <span style={{ fontSize: 12, color: "var(--text-muted)", padding: "6px 10px" }}>
                                  Unavailable
                                </span>
                              ) : !isSelected ? (
                                <button
                                  type="button"
                                  className="btn-primary"
                                  style={{
                                    padding: "7px 14px",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    borderRadius: 10,
                                    minHeight: 38,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                  }}
                                  onClick={() => handleAddOrIncrement(m.variant.id, m.variant.current_stock)}
                                >
                                  <Plus size={15} /> Use
                                </button>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <button
                                    type="button"
                                    className="stepper-btn"
                                    onClick={() => handleDecrement(m.variant.id)}
                                    title="Decrease quantity"
                                  >
                                    <Minus size={15} />
                                  </button>

                                  <input
                                    type="number"
                                    className="input-base"
                                    style={{
                                      width: 48,
                                      height: 38,
                                      textAlign: "center",
                                      padding: "0 2px",
                                      fontSize: 15,
                                      fontWeight: 700,
                                      margin: 0,
                                      color: "var(--accent-primary)",
                                      borderRadius: 10,
                                    }}
                                    value={qty}
                                    min={1}
                                    max={m.variant.current_stock}
                                    onChange={e => handleDirectQtyChange(m.variant.id, e.target.value, m.variant.current_stock)}
                                  />

                                  <button
                                    type="button"
                                    className="stepper-btn"
                                    disabled={qty >= m.variant.current_stock}
                                    onClick={() => handleAddOrIncrement(m.variant.id, m.variant.current_stock)}
                                    title="Increase quantity"
                                  >
                                    <Plus size={15} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Tab 2: Selected Materials Only */
                <>
                  {selectedVariantsList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>No materials selected yet</div>
                      <div style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}>
                        Browse all materials and tap &quot;+ Use&quot; on any item to add it to your usage list.
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setBulkTab("catalog")}
                        style={{ margin: "0 auto", fontSize: 13 }}
                      >
                        Browse All Materials
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          Review materials to be logged:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedUsage({})}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--accent-red)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Clear All
                        </button>
                      </div>

                      {selectedVariantsList.map(m => {
                        const qty = selectedUsage[m.variant.id] || 0;
                        return (
                          <div
                            key={m.variant.id}
                            style={{
                              padding: "12px 14px",
                              borderRadius: 14,
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                                {m.item.name}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                                {m.variant.variant_label} · In Stock: {m.variant.current_stock} {m.item.unit}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--accent-emerald)", marginTop: 2 }}>
                                Remaining after: {m.variant.current_stock - qty} {m.item.unit}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <button
                                  type="button"
                                  className="stepper-btn"
                                  onClick={() => handleDecrement(m.variant.id)}
                                >
                                  <Minus size={15} />
                                </button>
                                <span style={{
                                  minWidth: 32,
                                  textAlign: "center",
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: "var(--accent-primary)",
                                }}>
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  className="stepper-btn"
                                  disabled={qty >= m.variant.current_stock}
                                  onClick={() => handleAddOrIncrement(m.variant.id, m.variant.current_stock)}
                                >
                                  <Plus size={15} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(m.variant.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--text-muted)",
                                  cursor: "pointer",
                                  padding: 6,
                                }}
                                title="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Fixed Sticky Footer */}
            <div style={{
              padding: "14px 18px",
              borderTop: "1px solid var(--border)",
              background: "var(--bg-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Total units: {totalUnits}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setBulkModalOpen(false)}
                  style={{ minHeight: 42, padding: "8px 16px", fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleBulkSubmit}
                  disabled={bulkLoading || selectedCount === 0}
                  style={{
                    minHeight: 42,
                    padding: "8px 20px",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {bulkLoading ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16 }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown size={16} />
                      <span>Confirm Usage ({selectedCount})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
