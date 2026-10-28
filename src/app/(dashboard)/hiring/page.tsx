"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Phone,
  MessageSquare,
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Download,
  UserCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Briefcase,
  IndianRupee,
  ShieldAlert,
  ArrowRight,
  Filter,
  Users,
} from "lucide-react";
import { HiringCandidate, CandidateRole, CandidateStatus } from "@/types";
import { formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string; bg: string; border: string }> = {
  inquiry: {
    label: "📞 Inquiry / Called",
    color: "var(--accent-primary)",
    bg: "rgba(108,143,255,0.12)",
    border: "rgba(108,143,255,0.3)",
  },
  interview_scheduled: {
    label: "📅 Interview Scheduled",
    color: "var(--accent-secondary)",
    bg: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.35)",
  },
  interview_done: {
    label: "✅ Interview Done",
    color: "var(--accent-amber)",
    bg: "rgba(251,191,36,0.15)",
    border: "rgba(251,191,36,0.35)",
  },
  selected: {
    label: "🎉 Selected / Offered",
    color: "var(--accent-emerald)",
    bg: "rgba(52,211,153,0.15)",
    border: "rgba(52,211,153,0.35)",
  },
  joined: {
    label: "🤝 Joined",
    color: "#10b981",
    bg: "rgba(16,185,129,0.2)",
    border: "rgba(16,185,129,0.4)",
  },
  rejected: {
    label: "❌ Rejected",
    color: "var(--accent-red)",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.3)",
  },
  dropped: {
    label: "⚠️ Dropped / No Show",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.25)",
  },
};

const ROLE_CONFIG: Record<CandidateRole, { label: string; color: string; bg: string }> = {
  teacher: { label: "👩‍🏫 Teacher", color: "var(--accent-primary)", bg: "rgba(108,143,255,0.15)" },
  ayyamma: { label: "🧹 Ayyamma (Helper)", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  other: { label: "🏢 Other Staff", color: "#cbd5e1", bg: "rgba(148,163,184,0.15)" },
};

interface CandidateFormData {
  candidate_name: string;
  phone: string;
  role_type: CandidateRole;
  status: CandidateStatus;
  call_date: string;
  interview_date: string;
  experience: string;
  location: string;
  expected_salary: string;
  notes: string;
}

const defaultForm: CandidateFormData = {
  candidate_name: "",
  phone: "",
  role_type: "teacher",
  status: "inquiry",
  call_date: new Date().toISOString().slice(0, 10),
  interview_date: "",
  experience: "",
  location: "",
  expected_salary: "",
  notes: "",
};

export default function HiringPage() {
  const { data: session, status: authStatus } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [candidates, setCandidates] = useState<HiringCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | CandidateRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CandidateStatus>("all");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<HiringCandidate | null>(null);
  const [formData, setFormData] = useState<CandidateFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchCandidates();
    }
  }, [isAdmin]);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const res = await fetch("/api/hiring");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load candidates");
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch candidate list");
    } finally {
      setLoading(false);
    }
  }

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.candidate_name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      const matchesRole = roleFilter === "all" || c.role_type === roleFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [candidates, search, roleFilter, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = candidates.length;
    const teachers = candidates.filter((c) => c.role_type === "teacher").length;
    const ayyamma = candidates.filter((c) => c.role_type === "ayyamma").length;
    const scheduled = candidates.filter((c) => c.status === "interview_scheduled").length;
    const selected = candidates.filter((c) => c.status === "selected" || c.status === "joined").length;
    return { total, teachers, ayyamma, scheduled, selected };
  }, [candidates]);

  function openCreateModal() {
    setEditingCandidate(null);
    setFormData({
      ...defaultForm,
      call_date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  }

  function openEditModal(c: HiringCandidate) {
    setEditingCandidate(c);
    setFormData({
      candidate_name: c.candidate_name,
      phone: c.phone,
      role_type: c.role_type,
      status: c.status,
      call_date: c.call_date || "",
      interview_date: c.interview_date || "",
      experience: c.experience || "",
      location: c.location || "",
      expected_salary: c.expected_salary || "",
      notes: c.notes || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.candidate_name.trim()) {
      toast.error("Please enter candidate name");
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      toast.error("Please enter a contact phone number");
      return;
    }
    if (cleanPhone.length !== 10) {
      toast.error(`Phone number must be exactly 10 digits (${cleanPhone.length}/10 entered)`);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Invalid mobile number: Indian phone numbers must start with 6, 7, 8, or 9");
      return;
    }

    setSaving(true);
    try {
      if (editingCandidate) {
        // Update
        const res = await fetch("/api/hiring", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCandidate.id, ...formData, phone: cleanPhone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        toast.success("Candidate updated ✅");
      } else {
        // Create
        const res = await fetch("/api/hiring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, phone: cleanPhone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Creation failed");
        toast.success("New candidate call logged! 📞");
      }

      setModalOpen(false);
      fetchCandidates();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickStatusChange(id: string, newStatus: CandidateStatus) {
    try {
      const res = await fetch("/api/hiring", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      toast.success("Status updated ✅");
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this candidate record?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/hiring?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Candidate removed");
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Failed to delete candidate");
    } finally {
      setDeletingId(null);
    }
  }

  function exportCSV() {
    if (candidates.length === 0) {
      toast.error("No candidate data to export");
      return;
    }

    const headers = [
      "Candidate Name",
      "Contact Number",
      "Role Type",
      "Status",
      "Call Date",
      "Interview Date",
      "Experience",
      "Location / Area",
      "Expected Salary",
      "Notes",
    ];

    const rows = candidates.map((c) => [
      `"${c.candidate_name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.role_type}"`,
      `"${c.status}"`,
      `"${c.call_date}"`,
      `"${c.interview_date || ""}"`,
      `"${(c.experience || "").replace(/"/g, '""')}"`,
      `"${(c.location || "").replace(/"/g, '""')}"`,
      `"${(c.expected_salary || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Hiring_Candidates_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Hiring records exported to CSV 📥");
  }

  const isPhoneValid = formData.phone.length === 10 && /^[6-9]\d{9}$/.test(formData.phone);
  const isPhoneIncomplete = formData.phone.length > 0 && formData.phone.length < 10;
  const isPhonePrefixError = formData.phone.length > 0 && !/^[6-9]/.test(formData.phone);

  // If not admin
  if (authStatus !== "loading" && !isAdmin) {
    return (
      <div className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="glass-card" style={{ maxWidth: 460, textAlign: "center", padding: "40px 24px" }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%", background: "rgba(248,113,113,0.12)",
            color: "var(--accent-red)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
          }}>
            <ShieldAlert size={30} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
            Admin Access Required
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
            The Staff Hiring & Caller Tracker is restricted to school administrators to manage confidential candidate records.
          </p>
          <Link href="/dashboard" className="btn-primary" style={{ display: "inline-flex", justifyContent: "center" }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="section-header" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>📞</span>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
              Staff Hiring &amp; Caller Tracker
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            Log and manage caller inquiries from posters, schedule interviews, and track Teacher &amp; Ayyamma hiring.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={exportCSV}
            style={{ minHeight: 42, padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
            style={{ minHeight: 42, padding: "8px 18px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} /> Log New Call / Candidate
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Calls</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{metrics.total}</div>
        </div>
        <div className="glass-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>👩‍🏫 Teachers</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{metrics.teachers}</div>
        </div>
        <div className="glass-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" }}>🧹 Ayyamma</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{metrics.ayyamma}</div>
        </div>
        <div className="glass-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-secondary)", textTransform: "uppercase" }}>📅 Scheduled</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{metrics.scheduled}</div>
        </div>
        <div className="glass-card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase" }}>🎉 Selected/Joined</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{metrics.selected}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
            <Search size={16} />
            <input
              placeholder="Search by candidate name, phone, area, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Role Filter Chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`chip ${roleFilter === "all" ? "active" : ""}`}
              onClick={() => setRoleFilter("all")}
            >
              All Roles
            </button>
            <button
              type="button"
              className={`chip ${roleFilter === "teacher" ? "active" : ""}`}
              onClick={() => setRoleFilter("teacher")}
            >
              👩‍🏫 Teachers
            </button>
            <button
              type="button"
              className={`chip ${roleFilter === "ayyamma" ? "active" : ""}`}
              onClick={() => setRoleFilter("ayyamma")}
            >
              🧹 Ayyamma
            </button>
            <button
              type="button"
              className={`chip ${roleFilter === "other" ? "active" : ""}`}
              onClick={() => setRoleFilter("other")}
            >
              🏢 Other Staff
            </button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          <button
            type="button"
            className={`chip ${statusFilter === "all" ? "active" : ""}`}
            style={{ fontSize: 12, padding: "4px 10px", whiteSpace: "nowrap" }}
            onClick={() => setStatusFilter("all")}
          >
            All Statuses ({candidates.length})
          </button>
          {(Object.keys(STATUS_CONFIG) as CandidateStatus[]).map((st) => {
            const count = candidates.filter((c) => c.status === st).length;
            return (
              <button
                key={st}
                type="button"
                className={`chip ${statusFilter === st ? "active" : ""}`}
                style={{ fontSize: 12, padding: "4px 10px", whiteSpace: "nowrap" }}
                onClick={() => setStatusFilter(st)}
              >
                {STATUS_CONFIG[st].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Candidate List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">📞</div>
          <div className="empty-state-title">No candidate inquiries found</div>
          <div className="empty-state-desc">
            {search || roleFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search filters."
              : "When people call your school hiring number, click 'Log New Call' to record their details."}
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
            style={{ marginTop: 16 }}
          >
            <Plus size={16} /> Log First Candidate Call
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table table-responsive">
            <table className="data-table" style={{ width: "100%", minWidth: 840 }}>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Call &amp; Interview</th>
                  <th>Experience &amp; Area</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => {
                  const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.inquiry;
                  const roleInfo = ROLE_CONFIG[c.role_type] || ROLE_CONFIG.teacher;
                  const cleanPhone = c.phone.replace(/\D/g, "");

                  return (
                    <tr key={c.id}>
                      {/* Name & Notes */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                          {c.candidate_name}
                        </div>
                        {c.notes && (
                          <div style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                            {c.notes}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 8,
                          background: roleInfo.bg,
                          color: roleInfo.color,
                          whiteSpace: "nowrap",
                        }}>
                          {roleInfo.label}
                        </span>
                      </td>

                      {/* Phone & Direct Links */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <a
                            href={`tel:${c.phone}`}
                            style={{
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Phone size={13} style={{ color: "var(--accent-emerald)" }} />
                            <span>{c.phone}</span>
                          </a>
                          {cleanPhone.length >= 10 && (
                            <a
                              href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                                `Hello ${c.candidate_name}, this is from the preschool management regarding your inquiry for the ${c.role_type} position.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                background: "rgba(52,211,153,0.15)",
                                color: "var(--accent-emerald)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <MessageSquare size={13} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Dates */}
                      <td>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          Called: {formatDate(c.call_date)}
                        </div>
                        {c.interview_date ? (
                          <div style={{ fontSize: 12, color: "var(--accent-secondary)", fontWeight: 600, marginTop: 2 }}>
                            Interview: {formatDate(c.interview_date)}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            No interview set
                          </div>
                        )}
                      </td>

                      {/* Experience & Location */}
                      <td>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          {c.experience || "Fresher / Unspecified"}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          {c.location || "Area not specified"}
                          {c.expected_salary ? ` · ₹${c.expected_salary}` : ""}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td>
                        <select
                          className="input-base"
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            height: 32,
                            borderRadius: 8,
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            borderColor: statusInfo.border,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          value={c.status}
                          onChange={(e) => handleQuickStatusChange(c.id, e.target.value as CandidateStatus)}
                        >
                          {(Object.keys(STATUS_CONFIG) as CandidateStatus[]).map((st) => (
                            <option key={st} value={st} style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}>
                              {STATUS_CONFIG[st].label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            title="Edit candidate"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            style={{
                              padding: "6px 10px",
                              fontSize: 12,
                              borderRadius: 8,
                              background: "rgba(248,113,113,0.1)",
                              border: "1px solid rgba(248,113,113,0.25)",
                              color: "var(--accent-red)",
                              cursor: "pointer",
                            }}
                            title="Delete candidate"
                          >
                            <Trash2 size={13} />
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
            {filteredCandidates.map((c) => {
              const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.inquiry;
              const roleInfo = ROLE_CONFIG[c.role_type] || ROLE_CONFIG.teacher;
              const cleanPhone = c.phone.replace(/\D/g, "");

              return (
                <div
                  key={c.id}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* Top: Name & Role Badge */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
                        {c.candidate_name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        Called: {formatDate(c.call_date)}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 9px",
                      borderRadius: 8,
                      background: roleInfo.bg,
                      color: roleInfo.color,
                      flexShrink: 0,
                    }}>
                      {roleInfo.label}
                    </span>
                  </div>

                  {/* 1-Tap Call & WhatsApp Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <a
                      href={`tel:${c.phone}`}
                      className="btn-secondary"
                      style={{
                        padding: "10px",
                        fontSize: 13,
                        fontWeight: 700,
                        justifyContent: "center",
                        minHeight: 42,
                        textDecoration: "none",
                        color: "var(--text-primary)",
                        borderColor: "rgba(52,211,153,0.3)",
                      }}
                    >
                      <Phone size={15} style={{ color: "var(--accent-emerald)" }} />
                      <span>Call Now</span>
                    </a>

                    <a
                      href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                        `Hello ${c.candidate_name}, this is from the preschool management regarding your inquiry for the ${c.role_type} position.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{
                        padding: "10px",
                        fontSize: 13,
                        fontWeight: 700,
                        justifyContent: "center",
                        minHeight: 42,
                        textDecoration: "none",
                        color: "var(--accent-emerald)",
                        background: "rgba(52,211,153,0.08)",
                        borderColor: "rgba(52,211,153,0.3)",
                      }}
                    >
                      <MessageSquare size={15} />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Candidate Specs & Notes */}
                  <div style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}>
                    {c.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
                        <MapPin size={13} style={{ color: "var(--text-muted)" }} />
                        <span>Area: <strong style={{ color: "var(--text-primary)" }}>{c.location}</strong></span>
                      </div>
                    )}
                    {c.experience && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
                        <Briefcase size={13} style={{ color: "var(--text-muted)" }} />
                        <span>Experience: <strong style={{ color: "var(--text-primary)" }}>{c.experience}</strong></span>
                      </div>
                    )}
                    {c.interview_date && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-secondary)" }}>
                        <Calendar size={13} />
                        <span>Interview Scheduled: <strong>{formatDate(c.interview_date)}</strong></span>
                      </div>
                    )}
                    {c.notes && (
                      <div style={{ color: "var(--text-muted)", fontSize: 11, fontStyle: "italic", borderTop: "1px dashed var(--border)", paddingTop: 6, marginTop: 2 }}>
                        &ldquo;{c.notes}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown & Edit / Delete */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <select
                        className="input-base"
                        style={{
                          fontSize: 12,
                          padding: "8px 10px",
                          width: "100%",
                          borderRadius: 10,
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          borderColor: statusInfo.border,
                          fontWeight: 700,
                        }}
                        value={c.status}
                        onChange={(e) => handleQuickStatusChange(c.id, e.target.value as CandidateStatus)}
                      >
                        {(Object.keys(STATUS_CONFIG) as CandidateStatus[]).map((st) => (
                          <option key={st} value={st} style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}>
                            {STATUS_CONFIG[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="btn-secondary"
                      style={{ padding: "8px 12px", minHeight: 38 }}
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      style={{
                        padding: "8px 12px",
                        minHeight: 38,
                        borderRadius: 10,
                        background: "rgba(248,113,113,0.1)",
                        border: "1px solid rgba(248,113,113,0.25)",
                        color: "var(--accent-red)",
                        cursor: "pointer",
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─── Add / Edit Candidate Modal ──────────────────────────────────────── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="bulk-modal-box" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: "rgba(108,143,255,0.12)",
                  color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                }}>
                  📞
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
                    {editingCandidate ? "Edit Candidate Details" : "Log New Caller / Candidate"}
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
                    Record inquiry from school hiring banner or poster
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 8 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* 1. Candidate Name & Phone */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Candidate Name *</label>
                    <input
                      className="input-base"
                      placeholder="e.g. Lakshmi Devi"
                      value={formData.candidate_name}
                      onChange={(e) => setFormData((f) => ({ ...f, candidate_name: e.target.value }))}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>Contact Phone Number *</label>
                      <span style={{ fontSize: 11, color: isPhoneValid ? "var(--accent-emerald)" : isPhoneIncomplete || isPhonePrefixError ? "var(--accent-amber)" : "var(--text-muted)", fontWeight: 600 }}>
                        {formData.phone ? `${formData.phone.length}/10 digits` : "10 digits required"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{
                        padding: "10px 12px",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRight: "none",
                        borderRadius: "10px 0 0 10px",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--accent-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        userSelect: "none",
                        flexShrink: 0,
                      }}>
                        🇮🇳 +91
                      </span>
                      <input
                        className="input-base"
                        style={{
                          borderRadius: "0 10px 10px 0",
                          borderColor: isPhonePrefixError || (formData.phone.length === 10 && !isPhoneValid)
                            ? "var(--accent-red)"
                            : isPhoneValid
                            ? "rgba(52,211,153,0.5)"
                            : "var(--border)",
                        }}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        placeholder="10-digit number (e.g. 9876543210)"
                        value={formData.phone}
                        onChange={(e) => {
                          // Reject any non-digit/string characters immediately
                          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setFormData((f) => ({ ...f, phone: digitsOnly }));
                        }}
                        required
                      />
                    </div>

                    {/* Inline real-time validation message */}
                    {formData.phone.length > 0 && (
                      <div style={{ fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        {isPhonePrefixError ? (
                          <span style={{ color: "var(--accent-red)", fontWeight: 600 }}>
                            ⚠️ Indian mobile numbers should start with 6, 7, 8, or 9
                          </span>
                        ) : isPhoneIncomplete ? (
                          <span style={{ color: "var(--accent-amber)" }}>
                            ⚠️ Enter all 10 digits ({10 - formData.phone.length} more needed)
                          </span>
                        ) : isPhoneValid ? (
                          <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
                            ✅ Valid 10-digit Indian mobile number
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Role Type & Status */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Role Applied For *</label>
                    <select
                      className="input-base"
                      value={formData.role_type}
                      onChange={(e) => setFormData((f) => ({ ...f, role_type: e.target.value as CandidateRole }))}
                    >
                      <option value="teacher">👩‍🏫 Teacher (Nursery / LKG / UKG)</option>
                      <option value="ayyamma">🧹 Ayyamma (Helper / Caretaker)</option>
                      <option value="other">🏢 Other Staff (Security / Driver / Admin)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Hiring Status *</label>
                    <select
                      className="input-base"
                      value={formData.status}
                      onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value as CandidateStatus }))}
                    >
                      {(Object.keys(STATUS_CONFIG) as CandidateStatus[]).map((st) => (
                        <option key={st} value={st}>
                          {STATUS_CONFIG[st].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Call Date & Interview Date with visible Calendar Icons */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={14} style={{ color: "var(--accent-primary)" }} />
                      <span>Call / Inquiry Date *</span>
                    </label>
                    <input
                      className="input-base"
                      type="date"
                      value={formData.call_date}
                      onChange={(e) => setFormData((f) => ({ ...f, call_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={14} style={{ color: "var(--accent-secondary)" }} />
                      <span>Scheduled Interview Date (optional)</span>
                    </label>
                    <input
                      className="input-base"
                      type="date"
                      value={formData.interview_date}
                      onChange={(e) => setFormData((f) => ({ ...f, interview_date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 4. Location & Experience */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Residential Area / Location</label>
                    <input
                      className="input-base"
                      placeholder="e.g. Ram Nagar, 1.5 km away"
                      value={formData.location}
                      onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Experience / Qualification</label>
                    <input
                      className="input-base"
                      placeholder="e.g. 2 yrs preschool experience"
                      value={formData.experience}
                      onChange={(e) => setFormData((f) => ({ ...f, experience: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 5. Expected Salary & Notes */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Expected Monthly Salary (optional)</label>
                  <input
                    className="input-base"
                    placeholder="e.g. ₹10,000 / month"
                    value={formData.expected_salary}
                    onChange={(e) => setFormData((f) => ({ ...f, expected_salary: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Call Notes / Initial Remarks</label>
                  <textarea
                    className="input-base"
                    rows={3}
                    placeholder="e.g. Saw poster near bus stop. Available immediately, polite on phone, requested morning shift..."
                    value={formData.notes}
                    onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--border)",
                background: "var(--bg-card)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
              }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                  style={{ minHeight: 42, padding: "8px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{ minHeight: 42, padding: "8px 22px", fontWeight: 700 }}
                >
                  {saving ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="spinner" style={{ width: 16, height: 16 }} />
                      <span>Saving...</span>
                    </div>
                  ) : editingCandidate ? (
                    "Save Changes"
                  ) : (
                    "Save Candidate Call"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

