import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function PUT(request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Current password and new password are required" },
                { status: 400 }
            );
        }

        // Get user's current password hash
        const userRows = await sql`
      SELECT password_hash FROM app_user WHERE id = ${session.id}
    `;

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userRows[0];

        // Verify current password
        const isValid = await verifyPassword(currentPassword, user.password_hash);
        if (!isValid) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password
        await sql`
      UPDATE app_user
      SET password_hash = ${hashedNewPassword}
      WHERE id = ${session.id}
    `;

        return NextResponse.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            { error: "Failed to change password" },
            { status: 500 }
        );
    }
}
