import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUsers, updateUserRole } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await getUsers();
    const hasExistingAdmin = users.some((u) => u.role === "admin");

    // Allow claiming admin if there are no existing admins OR if there is only 1 user registered
    if (!hasExistingAdmin || users.length <= 1) {
      await updateUserRole(session.user.email, "admin");
      return NextResponse.json({
        success: true,
        message: "You have been promoted to Admin! Please sign out and sign back in for the changes to take effect.",
      });
    }

    return NextResponse.json(
      { error: "An administrator already exists. Please ask the school head to promote your account." },
      { status: 403 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

