import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
	try {
		const cookieStore = await cookies();
		const adminEmail = cookieStore.get("mock_user_email")?.value;

		if (!adminEmail) {
			return NextResponse.json({ pushEnabled: true, emailEnabled: true });
		}

		// Find admin user
		const user = await prisma.lead.findFirst({
			where: { email: adminEmail },
			include: { alerts: true },
		});

		if (!user || !user.alerts) {
			return NextResponse.json({ pushEnabled: true, emailEnabled: true });
		}

		const alert = user.alerts[0];
		return NextResponse.json({
			pushEnabled: alert?.pushEnabled ?? true,
			emailEnabled: alert?.emailEnabled ?? true,
		});
	} catch (error: any) {
		console.error("Settings GET error:", error.message);
		// Default to enabled if error
		return NextResponse.json({ pushEnabled: true, emailEnabled: true });
	}
}

export async function POST(req: NextRequest) {
	try {
		const cookieStore = await cookies();
		const adminEmail = cookieStore.get("mock_user_email")?.value;
		const body = await req.json();
		const { pushEnabled, emailEnabled } = body;

		if (!adminEmail) {
			return NextResponse.json(
				{ success: false, error: "Not authenticated" },
				{ status: 401 }
			);
		}

		// Find admin user
		const user = await prisma.lead.findFirst({
			where: { email: adminEmail },
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, error: "Admin user not found" },
				{ status: 404 }
			);
		}

		// Upsert UserAlert for this admin
		await prisma.userAlert.upsert({
			where: { userId: user.id },
			update: {
				pushEnabled: pushEnabled ?? true,
				emailEnabled: emailEnabled ?? true,
			},
			create: {
				userId: user.id,
				pushEnabled: pushEnabled ?? true,
				emailEnabled: emailEnabled ?? true,
				smsEnabled: false,
				whatsappEnabled: false,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("Settings POST error:", error.message);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
