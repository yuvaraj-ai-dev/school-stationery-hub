"use client";
import { useEffect, useState } from "react";
import { StockLog } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Search, Download, ArrowUp, ArrowDown, Filter } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterEvent, setFilterEvent] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetch("/api/logs").then(r => r.json()).then(data => {
      setLogs(Array.isArray(data) ? [...data].sort((a, b) => b.created_at.localeCompare(a.created_at)) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const uniqueEvents = [...new Set(logs.map(l => l.event).filter(Boolean))];

  const filtered = logs.filter(log => {
    const matchSearch = log.item_name.toLowerCase().includes(search.toLowerCase()) ||
      log.variant_label.toLowerCase().includes(search.toLowerCase()) ||
      log.used_by_name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || log.action_type === filterType;
    const matchEvent = filterEvent === "all" || log.event === filterEvent;
    const matchFrom = !dateFrom || log.created_at >= dateFrom;
    const matchTo = !dateTo || log.created_at <= dateTo + "T23:59:59";
    return matchSearch && matchType && matchEvent && matchFrom && matchTo;
  });

  function exportCSV() {
    const headers = ["Date","Item","Variant","Action","Qty","Before","After","By","Event","Notes"];
    const rows = filtered.map(l => [
      formatDateTime(l.created_at), l.item_name, l.variant_label, l.action_type,
      l.quantity, l.stock_before, l.stock_after, l.used_by_name, l.event || "", l.notes || "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `stock-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            📋 Usage Logs
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Full audit trail of all stock additions and usage</p>
        </div>
        <button className="btn-secondary" onClick={exportCSV}><Download size={16} /> Export CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Search item, variant, person..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["all","add","use"] as const).map(t => (
            <button key={t} className={`chip ${filterType === t ? "active" : ""}`} onClick={() => setFilterType(t)}>
              {t === "all" ? "All" : t === "add" ? "➕ Added" : "📤 Used"}
            </button>
          ))}
        </div>
        {uniqueEvents.length > 0 && (
          <select className="input-base" style={{ width: "auto" }} value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
            <option value="all">All Events</option>
            {uniqueEvents.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Filter size={14} style={{ color: "var(--text-muted)" }} />
          <input type="date" className="input-base" style={{ width: "auto" }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>to</span>
          <input type="date" className="input-base" style={{ width: "auto" }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 12, fontSize: 13, color: "var(--text-muted)" }}>
        Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of {logs.length} records
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Item</th>
                <th>Variant</th>
                <th>Action</th>
                <th>Qty</th>
                <th>Before → After</th>
                <th>Logged By</th>
                <th>Event</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>No logs found matching your filters</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{formatDateTime(log.created_at)}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{log.item_name}</td>
                  <td><span className="tag tag-blue">{log.variant_label}</span></td>
                  <td>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: log.action_type === "add" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                      color: log.action_type === "add" ? "#34d399" : "#f87171",
                    }}>
                      {log.action_type === "add" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {log.action_type === "add" ? "Added" : "Used"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: log.action_type === "add" ? "#34d399" : "#f87171" }}>
                    {log.action_type === "add" ? "+" : "-"}{log.quantity}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {log.stock_before} → <strong style={{ color: "var(--text-primary)" }}>{log.stock_after}</strong>
                  </td>
                  <td style={{ fontSize: 13 }}>{log.used_by_name}</td>
                  <td>{log.event ? <span className="tag tag-purple">{log.event}</span> : "-"}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
