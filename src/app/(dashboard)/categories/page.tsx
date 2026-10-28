"use client";
import { useEffect, useState } from "react";
import { Category } from "@/types";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ICONS = ["📄","🖍️","🎨","📒","🧹","✏️","📏","🖌️","📌","🗂️","📎","✂️","🧴","🧻"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("teacher");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; cat?: Category } | null>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "📦" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
    fetch("/api/auth/session").then(r => r.json()).then(s => setRole(s?.user?.role || "teacher"));
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const data = await fetch("/api/categories").then(r => r.json());
      setCategories(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load categories"); }
    setLoading(false);
  }

  function openAdd() { setForm({ name: "", description: "", icon: "📦" }); setModal({ mode: "add" }); }
  function openEdit(cat: Category) { setForm({ name: cat.name, description: cat.description, icon: cat.icon }); setModal({ mode: "edit", cat }); }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Category name is required"); return; }
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Category created!");
      } else {
        await fetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: modal?.cat?.id, ...form }) });
        toast.success("Category updated!");
      }
      setModal(null); fetchAll();
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      toast.success("Category deleted");
      setDeleteConfirm(null); fetchAll();
    } catch { toast.error("Failed to delete"); }
  }

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            🗂️ Categories
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Organise stationery into logical groups</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">🗂️</div>
          <div className="empty-state-title">No categories yet</div>
          <div className="empty-state-desc">Create your first category to start organising stationery.</div>
          <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(cat => (
            <div key={cat.id} className="glass-card glass-card-hover" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: "var(--bg-secondary)",
                  border: "1px solid var(--border)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 26,
                }}>
                  {cat.icon}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" style={{ padding: "6px 10px" }} onClick={() => openEdit(cat)}><Edit2 size={14} /></button>
                  {role === "admin" && (
                    <button className="btn-danger" style={{ padding: "6px 10px" }} onClick={() => setDeleteConfirm(cat.id)}><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{cat.name}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{cat.description || "No description"}</p>
              <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)" }}>Created {formatDate(cat.created_at)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
              {modal.mode === "add" ? "➕ New Category" : "✏️ Edit Category"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                      style={{
                        width: 40, height: 40, borderRadius: 10, fontSize: 20, cursor: "pointer",
                        border: form.icon === icon ? "2px solid var(--accent-primary)" : "1px solid var(--border)",
                        background: form.icon === icon ? "rgba(108,143,255,0.12)" : "var(--bg-secondary)",
                        transition: "all 0.15s",
                      }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="input-base" placeholder="e.g., Paper & Chart Materials" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input-base" placeholder="Short description..." value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                  {saving ? <div className="spinner" /> : modal.mode === "add" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "var(--accent-red)" }}>🗑️ Delete Category?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
              This will permanently delete the category. All items inside will lose their category link.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
