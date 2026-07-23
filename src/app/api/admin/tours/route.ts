import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const tours = await prisma.scheduleTour.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});

		const propertyIds = tours.map((t) => t.propertyId).filter(Boolean);
		const emails = tours.map((t) => t.email.toLowerCase().trim()).filter(Boolean);

		const [properties, leads] = await Promise.all([
			prisma.property.findMany({
				where: { id: { in: propertyIds } },
				select: { id: true, FullAddress: true },
			}),
			prisma.lead.findMany({
				where: { email: { in: emails } },
				select: { email: true, firstName: true, lastName: true, fullName: true },
			}),
		]);

		const propertyMap = new Map(properties.map((p) => [p.id, p.FullAddress]));
		const leadMap = new Map(
			leads.map((l) => [
				l.email.toLowerCase().trim(),
				l.fullName || `${l.firstName || ""} ${l.lastName || ""}`.trim(),
			])
		);

		const mappedTours = tours.map((t) => {
			const syncedLeadName = leadMap.get(t.email.toLowerCase().trim());
			return {
				id: t.id,
				propertyId: t.propertyId,
				propertyAddress: propertyMap.get(t.propertyId) || (t.propertyId ? "MLS: " + t.propertyId : "N/A"),
				userName: syncedLeadName || t.name || "Unknown User",
				userEmail: t.email,
				userPhone: t.phone || "",
				requestedDate: new Date(t.date).toLocaleDateString(),
				requestedTime: new Date(t.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				status: t.status || "Pending",
				message: t.message || "",
				createdAt: new Date(t.createdAt).toLocaleDateString(),
			};
		});

		return NextResponse.json({ success: true, tours: mappedTours });
	} catch (error: any) {
		console.error("Error fetching admin tours:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

