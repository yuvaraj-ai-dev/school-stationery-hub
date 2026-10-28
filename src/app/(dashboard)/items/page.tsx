"use client";
import { useEffect, useState } from "react";
import { Item, ItemVariant, Category } from "@/types";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, Search, X } from "lucide-react";

const VARIANT_ATTRIBUTE_OPTIONS = {
  color: ["White","Red","Blue","Green","Yellow","Orange","Pink","Purple","Brown","Black","Gold","Silver","Multi-color"],
  size: ["A1","A2","A3","A4","A5","Small","Medium","Large","6mm","10mm","15mm","20mm","15cm","30cm"],
  type: ["Flat","Round","Fine tip","Broad tip","Regular","Heavy-duty","Ruled","Plain","Grid"],
  grade: ["HB","B","2B","4B","6B","F","H"],
  brand: ["Camlin","Faber-Castell","Doms","Natraj","Expo","Scotch","Fevicol","3M","Dettol","Lifebuoy"],
  pack_size: ["1pc","5pcs","10pcs","12pcs","24pcs","48pcs","100pcs","50g","100g","200ml","500ml","1L"],
};

const UNITS = ["pcs","sheets","reams","bottles","boxes","rolls","packets","pairs","sets","sticks","tubes"];

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [variants, setVariants] = useState<ItemVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [role, setRole] = useState("teacher");

  // Modals
  const [itemModal, setItemModal] = useState<{ mode: "add" | "edit"; item?: Item } | null>(null);
  const [variantModal, setVariantModal] = useState<{ mode: "add" | "edit"; item: Item; variant?: ItemVariant } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "item" | "variant"; id: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [itemForm, setItemForm] = useState({ category_id: "", name: "", unit: "pcs", has_variants: true, variant_config: [] as string[] });
  const [variantForm, setVariantForm] = useState({ variant_label: "", color: "", size: "", type: "", grade: "", brand: "", pack_size: "", current_stock: "", min_threshold: "5" });

  useEffect(() => {
    fetchAll();
    fetch("/api/auth/session").then(r => r.json()).then(s => setRole(s?.user?.role || "teacher"));
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [i, v, c] = await Promise.all([
        fetch("/api/items").then(r => r.json()),
        fetch("/api/variants").then(r => r.json()),
        fetch("/api/categories").then(r => r.json()),
      ]);
      setItems(Array.isArray(i) ? i : []);
      setVariants(Array.isArray(v) ? v : []);
      setCategories(Array.isArray(c) ? c : []);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  }

  function autoLabel(form: typeof variantForm) {
    return [form.color, form.size, form.type, form.grade, form.brand, form.pack_size].filter(Boolean).join(" - ") || "Standard";
  }

  async function saveItem() {
    if (!itemForm.name.trim() || !itemForm.category_id) { toast.error("Name and category are required"); return; }
    setSaving(true);
    try {
      if (itemModal?.mode === "add") {
        await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemForm) });
        toast.success("Item created!");
      } else {
        await fetch("/api/items", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: itemModal?.item?.id, ...itemForm }) });
        toast.success("Item updated!");
      }
      setItemModal(null); fetchAll();
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  }

  async function saveVariant() {
    if (!variantForm.current_stock) { toast.error("Initial stock is required"); return; }
    const vf = { ...variantForm, variant_label: autoLabel(variantForm), item_id: variantModal?.item?.id };
    setSaving(true);
    try {
      if (variantModal?.mode === "add") {
        await fetch("/api/variants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vf) });
        toast.success("Variant added!");
      } else {
        await fetch("/api/variants", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: variantModal?.variant?.id, ...vf }) });
        toast.success("Variant updated!");
      }
      setVariantModal(null); fetchAll();
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "item") {
        await fetch("/api/items", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteConfirm.id }) });
        toast.success("Item deleted");
      } else {
        await fetch("/api/variants", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteConfirm.id }) });
        toast.success("Variant deleted");
      }
      setDeleteConfirm(null); fetchAll();
    } catch { toast.error("You don't have permission to delete"); }
  }

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || i.category_id === filterCat;
    return matchSearch && matchCat;
  });

  const toggleExpand = (id: string) => setExpandedItems(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            📋 Items & Variants
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Manage stationery items and their color/size/type variants</p>
        </div>
        <button className="btn-primary" onClick={() => { setItemForm({ category_id: "", name: "", unit: "pcs", has_variants: true, variant_config: [] }); setItemModal({ mode: "add" }); }}>
          <Plus size={16} /> New Item
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={`chip ${filterCat === "all" ? "active" : ""}`} onClick={() => setFilterCat("all")}>All</button>
          {categories.map(c => (
            <button key={c.id} className={`chip ${filterCat === c.id ? "active" : ""}`} onClick={() => setFilterCat(c.id)}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No items found</div>
          <button className="btn-primary" onClick={() => { setItemForm({ category_id: "", name: "", unit: "pcs", has_variants: true, variant_config: [] }); setItemModal({ mode: "add" }); }}>
            <Plus size={16} /> Add First Item
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(item => {
            const cat = categories.find(c => c.id === item.category_id);
            const itemVariants = variants.filter(v => v.item_id === item.id);
            const isExpanded = expandedItems.has(item.id);

            return (
              <div key={item.id} className="glass-card">
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => toggleExpand(item.id)}>
                  <div style={{ fontSize: 22 }}>{cat?.icon || "📦"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{item.name}</span>
                      <span className="tag tag-blue">{cat?.name || "Unknown"}</span>
                      <span className="tag tag-purple">{item.unit}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {itemVariants.length} variant{itemVariants.length !== 1 ? "s" : ""}
                      {item.variant_config.length > 0 && ` · Tracks: ${item.variant_config.join(", ")}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                    <button className="btn-secondary" style={{ padding: "6px 10px" }} onClick={() => {
                      setItemForm({ category_id: item.category_id, name: item.name, unit: item.unit, has_variants: item.has_variants, variant_config: item.variant_config });
                      setItemModal({ mode: "edit", item });
                    }}><Edit2 size={14} /></button>
                    {role === "admin" && (
                      <button className="btn-danger" style={{ padding: "6px 10px" }} onClick={() => setDeleteConfirm({ type: "item", id: item.id })}><Trash2 size={14} /></button>
                    )}
                    <button className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => {
                      setVariantForm({ variant_label: "", color: "", size: "", type: "", grade: "", brand: "", pack_size: "", current_stock: "", min_threshold: "5" });
                      setVariantModal({ mode: "add", item });
                    }}>
                      <Plus size={13} /> Variant
                    </button>
                  </div>
                  {isExpanded ? <ChevronDown size={16} style={{ color: "var(--text-muted)" }} /> : <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />}
                </div>

                {isExpanded && itemVariants.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "8px 20px 16px" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Variant Label</th>
                          <th>Color</th>
                          <th>Size</th>
                          <th>Type/Grade</th>
                          <th>Brand</th>
                          <th>Pack</th>
                          <th>Stock</th>
                          <th>Min Alert</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemVariants.map(v => (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{v.variant_label}</td>
                            <td>{v.color || "-"}</td>
                            <td>{v.size || "-"}</td>
                            <td>{v.type || v.grade || "-"}</td>
                            <td>{v.brand || "-"}</td>
                            <td>{v.pack_size || "-"}</td>
                            <td style={{ fontWeight: 700, color: v.current_stock === 0 ? "var(--accent-red)" : v.current_stock <= v.min_threshold ? "var(--accent-amber)" : "var(--accent-emerald)" }}>
                              {v.current_stock} {item.unit}
                            </td>
                            <td style={{ color: "var(--text-muted)" }}>{v.min_threshold}</td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="btn-secondary" style={{ padding: "5px 8px" }} onClick={() => {
                                  setVariantForm({ variant_label: v.variant_label, color: v.color || "", size: v.size || "", type: v.type || "", grade: v.grade || "", brand: v.brand || "", pack_size: v.pack_size || "", current_stock: String(v.current_stock), min_threshold: String(v.min_threshold) });
                                  setVariantModal({ mode: "edit", item, variant: v });
                                }}><Edit2 size={13} /></button>
                                {role === "admin" && (
                                  <button className="btn-danger" style={{ padding: "5px 8px" }} onClick={() => setDeleteConfirm({ type: "variant", id: v.id })}><Trash2 size={13} /></button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Item Modal */}
      {itemModal && (
        <div className="modal-overlay" onClick={() => setItemModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
              {itemModal.mode === "add" ? "➕ New Item" : "✏️ Edit Item"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="input-base" value={itemForm.category_id} onChange={e => setItemForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input className="input-base" placeholder="e.g., Chart Paper" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit of Measurement</label>
                <select className="input-base" value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Variant Attributes to Track</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.keys(VARIANT_ATTRIBUTE_OPTIONS).map(attr => (
                    <button key={attr} type="button"
                      className={`chip ${itemForm.variant_config.includes(attr) ? "active" : ""}`}
                      onClick={() => setItemForm(f => ({
                        ...f,
                        variant_config: f.variant_config.includes(attr)
                          ? f.variant_config.filter(a => a !== attr)
                          : [...f.variant_config, attr],
                      }))}>
                      {attr}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Select which attributes define a variant for this item</div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => setItemModal(null)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={saveItem} disabled={saving} style={{ flex: 2 }}>
                  {saving ? <div className="spinner" /> : itemModal.mode === "add" ? "Create Item" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {variantModal && (
        <div className="modal-overlay" onClick={() => setVariantModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {variantModal.mode === "add" ? "➕ Add Variant" : "✏️ Edit Variant"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
              {variantModal.item.name} — <em>Label: {autoLabel(variantForm) || "Standard"}</em>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {(["color","size","type","grade","brand","pack_size"] as const).map(attr => (
                <div key={attr} className="form-group">
                  <label className="form-label" style={{ textTransform: "capitalize" }}>{attr.replace("_", " ")}</label>
                  <input list={`${attr}-opts`} className="input-base" placeholder={`e.g., ${VARIANT_ATTRIBUTE_OPTIONS[attr][0]}`}
                    value={variantForm[attr]} onChange={e => setVariantForm(f => ({ ...f, [attr]: e.target.value }))} />
                  <datalist id={`${attr}-opts`}>
                    {VARIANT_ATTRIBUTE_OPTIONS[attr].map(o => <option key={o} value={o} />)}
                  </datalist>
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Initial Stock *</label>
                <input type="number" className="input-base" placeholder="0" value={variantForm.current_stock}
                  onChange={e => setVariantForm(f => ({ ...f, current_stock: e.target.value }))} min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Alert (min)</label>
                <input type="number" className="input-base" placeholder="5" value={variantForm.min_threshold}
                  onChange={e => setVariantForm(f => ({ ...f, min_threshold: e.target.value }))} min={0} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => setVariantModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={saveVariant} disabled={saving} style={{ flex: 2 }}>
                {saving ? <div className="spinner" /> : variantModal.mode === "add" ? "Add Variant" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-red)", marginBottom: 12 }}>🗑️ Confirm Delete</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
              This will permanently delete the {deleteConfirm.type}. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
