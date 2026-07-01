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
		const properties = await prisma.property.findMany({
			where: {
				id: { in: propertyIds },
			},
			select: {
				id: true,
				FullAddress: true,
			},
		});

		const propertyMap = new Map(properties.map((p) => [p.id, p.FullAddress]));

		const mappedTours = tours.map((t) => ({
			id: t.id,
			propertyId: t.propertyId,
			propertyAddress: propertyMap.get(t.propertyId) || "MLS: " + t.propertyId,
			userName: t.name || "Unknown User",
			userEmail: t.email,
			userPhone: t.phone || "",
			requestedDate: new Date(t.date).toLocaleDateString(),
			requestedTime: new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			status: t.status || "Pending",
			message: t.message || "",
			createdAt: new Date(t.createdAt).toLocaleDateString(),
		}));

		return NextResponse.json({ success: true, tours: mappedTours });
	} catch (error: any) {
		console.error("Error fetching admin tours:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
