import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-crypto";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, newPassword } = body;

		if (!email || !newPassword) {
			return NextResponse.json(
				{ success: false, error: "Email and new password are required" },
				{ status: 400 }
			);
		}

		// 1. Fetch user by email
		const user = await prisma.user.findFirst({
			where: { email: email.toLowerCase().trim() },
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found with this email" },
				{ status: 404 }
			);
		}

		// 2. Hash new password
		const newHash = hashPassword(newPassword);

		// 3. Update user metadata
		const currentMetadata = (user.metadata as any) || {};
		const updatedMetadata = {
			...currentMetadata,
			passwordHash: newHash,
		};

		await prisma.user.update({
			where: { id: user.id },
			data: {
				metadata: updatedMetadata,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Password reset successful",
		});
	} catch (err: any) {
		console.error("Password reset error:", err);
		return NextResponse.json(
			{ success: false, error: "Internal server error during password reset" },
			{ status: 500 }
		);
	}
}
