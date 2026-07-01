import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const queryParams = req.nextUrl.searchParams;
		const limit = Number(queryParams.get("limit")) || 20;
		const page = Math.max(Number(queryParams.get("page")) || 1, 1);

		const skip = (page - 1) * limit;

		const [data, totalCount] = await Promise.all([
			prisma.community.findMany({
				include: {
					city: true,
				},
				orderBy: {
					id: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.community.count(),
		]);

		// Count properties per community by matching SubdivisionName (live count)
		const propertyCounts = await prisma.property.groupBy({
			by: ["SubdivisionName"],
			_count: { id: true },
		});

		// Build lookup map: lowercase subdivision name → count
		const countMap: Record<string, number> = {};
		for (const row of propertyCounts) {
			const key = (row.SubdivisionName || "").toLowerCase().trim();
			if (key) countMap[key] = (countMap[key] || 0) + row._count.id;
		}

		// Map to Mongoose shape for compatibility
		const mappedData = data.map((c) => ({
			...c,
			_id: c.id,
			Development: c.name,
			City: c.city?.name || "",
			// Use live count from Property table, fallback to stored
			PropertyCount: countMap[c.name.toLowerCase().trim()] ?? c.propertyCount,
			Images: c.images || [],
		}));

		return NextResponse.json({
			success: true,
			data: mappedData,
			totalCount,
			page,
			totalPages: Math.ceil(totalCount / limit),
		});
	} catch (error: any) {
		console.error("Error fetching communities:", error);
		return NextResponse.json(
			{ success: false, message: "Internal Server Error", error: error.message },
			{ status: 500 }
		);
	}
}
