// Types for the Stationery Management App

export type UserRole = "admin" | "teacher";

export interface AppUser {
  email: string;
  name: string;
  role: UserRole;
  profile_image?: string;
  last_login?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface Item {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  unit: string;
  has_variants: boolean;
  variant_config: string[]; // e.g. ["color","size"]
  created_at: string;
}

export interface ItemVariant {
  id: string;
  item_id: string;
  item_name?: string;
  category_name?: string;
  variant_label: string;
  color?: string;
  size?: string;
  type?: string;
  grade?: string;
  brand?: string;
  pack_size?: string;
  current_stock: number;
  min_threshold: number;
  unit?: string;
  created_at: string;
}

export interface StockLog {
  id: string;
  item_id: string;
  variant_id: string;
  item_name: string;
  variant_label: string;
  action_type: "add" | "use";
  quantity: number;
  stock_before: number;
  stock_after: number;
  used_by_email: string;
  used_by_name: string;
  event?: string;
  notes?: string;
  created_at: string;
}

export interface AppEvent {
  id: string;
  name: string;
  date: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export type StockStatus = "good" | "low" | "out";

export function getStockStatus(current: number, threshold: number): StockStatus {
  if (current === 0) return "out";
  if (current <= threshold) return "low";
  return "good";
}

export interface DashboardStats {
  totalItems: number;
  totalVariants: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCategories: number;
  usageThisMonth: number;
}

// ─── HIRING & RECRUITMENT ──────────────────────────────────────────────────────

export type CandidateRole = "teacher" | "ayyamma" | "other";

export type CandidateStatus =
  | "inquiry"
  | "interview_scheduled"
  | "interview_done"
  | "selected"
  | "joined"
  | "rejected"
  | "dropped";

export interface HiringCandidate {
  id: string;
  candidate_name: string;
  phone: string;
  role_type: CandidateRole;
  status: CandidateStatus;
  call_date: string;
  interview_date?: string;
  experience?: string;
  location?: string;
  expected_salary?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
