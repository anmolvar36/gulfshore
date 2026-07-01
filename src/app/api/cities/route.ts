import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const queryParams = req.nextUrl.searchParams;
		const limit = Number(queryParams.get("limit")) || 400;

		// Fetch cities
		const res = await prisma.city.findMany({
			orderBy: { id: "desc" },
			take: limit,
		});
		const totalCount = await prisma.city.count();

		// Count properties per city from the Property table (City is a plain string)
		const propertyCounts = await prisma.property.groupBy({
			by: ["City"],
			_count: { id: true },
		});

		// Build a lookup map: lowercase city name → count
		const countMap: Record<string, number> = {};
		for (const row of propertyCounts) {
			const key = (row.City || "").toLowerCase().trim();
			countMap[key] = (countMap[key] || 0) + row._count.id;
		}

		const mappedCities = res.map((c) => {
			const PropertyCount = countMap[c.name.toLowerCase().trim()] || 0;
			return {
				...c,
				_id: c.id,
				City: c.name,
				PropertyCount,
				Images: c.images || [],
			};
		});

		return NextResponse.json({
			success: true,
			data: mappedCities,
			totalCount,
		});
	} catch (error: any) {
		console.error("Error fetching cities:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 }
		);
	}
}
