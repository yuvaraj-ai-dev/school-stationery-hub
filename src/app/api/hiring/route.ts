import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getHiringCandidates,
  createHiringCandidate,
  updateHiringCandidate,
  deleteHiringCandidate,
} from "@/lib/db";
import { CandidateRole, CandidateStatus } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const candidates = await getHiringCandidates();
    return NextResponse.json(candidates);
  } catch (err: any) {
    console.error("Failed to get hiring candidates:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { candidate_name, phone, role_type, status, call_date, interview_date, experience, location, expected_salary, notes } = body;

    if (!candidate_name?.trim()) {
      return NextResponse.json({ error: "Candidate name is required" }, { status: 400 });
    }
    const cleanPhone = phone?.toString().replace(/\D/g, "") || "";
    if (!cleanPhone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Please enter a 10-digit Indian mobile number" }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: "Invalid mobile number: Indian phone numbers must start with 6, 7, 8, or 9" }, { status: 400 });
    }

    const candidate = await createHiringCandidate({
      candidate_name: candidate_name.trim(),
      phone: cleanPhone,
      role_type: (role_type as CandidateRole) || "teacher",
      status: (status as CandidateStatus) || "inquiry",
      call_date: call_date || new Date().toISOString().slice(0, 10),
      interview_date: interview_date || "",
      experience: experience || "",
      location: location || "",
      expected_salary: expected_salary || "",
      notes: notes || "",
      created_by: session.user.name || session.user.email || "",
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create hiring candidate:", err);
    return NextResponse.json({ error: err.message || "Failed to add candidate" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    if (updates.phone !== undefined) {
      const cleanPhone = updates.phone.toString().replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return NextResponse.json({ error: "Please enter a 10-digit Indian mobile number" }, { status: 400 });
      }
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return NextResponse.json({ error: "Invalid mobile number: Indian phone numbers must start with 6, 7, 8, or 9" }, { status: 400 });
      }
      updates.phone = cleanPhone;
    }

    const updated = await updateHiringCandidate(id, updates);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Failed to update candidate:", err);
    return NextResponse.json({ error: err.message || "Failed to update candidate" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    await deleteHiringCandidate(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete candidate:", err);
    return NextResponse.json({ error: err.message || "Failed to delete candidate" }, { status: 500 });
  }
}

