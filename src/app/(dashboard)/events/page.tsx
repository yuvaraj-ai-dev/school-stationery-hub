"use client";
import { useEffect, useState } from "react";
import { AppEvent, StockLog } from "@/types";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Calendar, Package, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EventsPage() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("teacher");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; event?: AppEvent } | null>(null);
  const [form, setForm] = useState({ name: "", date: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then(r => r.json()),
      fetch("/api/logs").then(r => r.json()),
    ]).then(([e, l]) => {
      setEvents(Array.isArray(e) ? e : []);
      setLogs(Array.isArray(l) ? l : []);
      setLoading(false);
    }).catch(() => setLoading(false));
    fetch("/api/auth/session").then(r => r.json()).then(s => setRole(s?.user?.role || "teacher"));
  }, []);

  async function saveEvent() {
    if (!form.name.trim()) { toast.error("Event name required"); return; }
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Event created!");
      } else {
        await fetch("/api/events", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: modal?.event?.id, ...form }) });
        toast.success("Event updated!");
      }
      setModal(null);
      const e = await fetch("/api/events").then(r => r.json());
      setEvents(Array.isArray(e) ? e : []);
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  }

  async function deleteEvent(id: string) {
    try {
      await fetch("/api/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      toast.success("Event deleted");
      setDeleteConfirm(null);
      setEvents(prev => prev.filter(e => e.id !== id));
      if (selected === id) setSelected(null);
    } catch { toast.error("Failed to delete"); }
  }

  // Event usage summary
  const selectedEvent = events.find(e => e.id === selected);
  const eventLogs = selectedEvent ? logs.filter(l => l.event === selectedEvent.name && l.action_type === "use") : [];
  const totalUsed = eventLogs.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            🎉 Events & Celebrations
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Track stationery usage per event or classroom activity</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ name: "", date: "", description: "" }); setModal({ mode: "add" }); }}>
          <Plus size={16} /> New Event
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <div className={selected ? "grid-responsive-2" : ""} style={{ gap: 20 }}>
          {/* Events list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {events.length === 0 ? (
              <div className="glass-card empty-state">
                <div className="empty-state-icon">🎉</div>
                <div className="empty-state-title">No events yet</div>
                <div className="empty-state-desc">Create events to tag stock usage (e.g., Christmas Party, Sports Day).</div>
                <button className="btn-primary" onClick={() => { setForm({ name: "", date: "", description: "" }); setModal({ mode: "add" }); }}>
                  <Plus size={16} /> Create First Event
                </button>
              </div>
            ) : events.map(event => {
              const eventUsage = logs.filter(l => l.event === event.name && l.action_type === "use");
              const usedTotal = eventUsage.reduce((s, l) => s + l.quantity, 0);
              const isActive = selected === event.id;

              return (
                <div key={event.id} className="glass-card glass-card-hover" style={{
                  padding: 20, cursor: "pointer",
                  border: isActive ? "1px solid var(--accent-primary)" : undefined,
                  background: isActive ? "rgba(108,143,255,0.06)" : undefined,
                }} onClick={() => setSelected(isActive ? null : event.id)}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 12, background: "var(--gradient-1)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                    }}>
                      🎉
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>{event.name}</h3>
                      {event.date && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                          <Calendar size={12} /> {formatDate(event.date)}
                        </div>
                      )}
                      {event.description && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{event.description}</p>}
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <span className="tag tag-blue"><Package size={11} /> {eventUsage.length} items logged</span>
                        <span className="tag tag-purple">{usedTotal} units used</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button className="btn-secondary" style={{ padding: "6px 9px" }} onClick={() => {
                        setForm({ name: event.name, date: event.date, description: event.description || "" });
                        setModal({ mode: "edit", event });
                      }}><Edit2 size={13} /></button>
                      {role === "admin" && (
                        <button className="btn-danger" style={{ padding: "6px 9px" }} onClick={() => setDeleteConfirm(event.id)}><Trash2 size={13} /></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Event detail panel */}
          {selected && selectedEvent && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                {selectedEvent.name} — Usage Report
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
                {selectedEvent.date ? formatDate(selectedEvent.date) : "No date set"} · {eventLogs.length} log entries · {totalUsed} total units used
              </p>

              {eventLogs.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 20px" }}>
                  <div className="empty-state-icon">📦</div>
                  <div className="empty-state-title">No usage logged for this event yet</div>
                  <div className="empty-state-desc">When you use stock and select this event, it will appear here.</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table" style={{ minWidth: 540 }}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Variant</th>
                        <th>Qty Used</th>
                        <th>Logged By</th>
                        <th>Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventLogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{log.item_name}</td>
                          <td><span className="tag tag-blue">{log.variant_label}</span></td>
                          <td style={{ fontWeight: 700, color: "#f87171" }}>-{log.quantity}</td>
                          <td>{log.used_by_name}</td>
                          <td style={{ fontSize: 12 }}>{formatDate(log.created_at)}</td>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{log.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700 }}>
                {modal.mode === "add" ? "🎉 New Event" : "✏️ Edit Event"}
              </h2>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input className="input-base" placeholder="e.g., Christmas Party 2024" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="input-base" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input-base" placeholder="Brief description..." value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 12, paddingBottom: 8 }}>
                <button className="btn-secondary" onClick={() => setModal(null)} style={{ flex: 1, minHeight: 44, justifyContent: "center" }}>Cancel</button>
                <button className="btn-primary" onClick={saveEvent} disabled={saving} style={{ flex: 2, minHeight: 44, justifyContent: "center" }}>
                  {saving ? <div className="spinner" /> : modal.mode === "add" ? "Create Event" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-red)", marginBottom: 12 }}>Delete Event?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>The event will be removed. Existing logs tagged to this event will remain but won&apos;t link back.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => deleteEvent(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
