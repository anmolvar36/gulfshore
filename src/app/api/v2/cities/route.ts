import { NextRequest, NextResponse } from "next/server";
import { redisGet, redisSet } from "@/lib/safeRedis";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	try {
		const queryParams = req.nextUrl.searchParams;

		const limit = Number(queryParams.get("limit")) || 20;
		const type = queryParams.get("type")?.trim() || "";

		// ----- CACHE KEY -----
		const cacheKey = `cities:${type || "all"}:limit-${limit}`;

		// ----- CHECK REDIS CACHE -----
		const cached = await redisGet(cacheKey);
		if (typeof cached === "string") {
			return NextResponse.json(JSON.parse(cached));
		}

		const allowedNames = [
			"NAPLES", "Naples",
			"BONITA SPRINGS", "Bonita Springs",
			"ESTERO", "Estero",
			"AVE MARIA", "Ave Maria",
			"MARCO ISLAND", "Marco Island",
			"FORT MYERS", "Fort Myers",
			"BABCOCK RANCH", "Babcock Ranch",
			"LEHIGH ACRES", "Lehigh Acres",
			"IMMOKALEE", "Immokalee",
			"PINE ISLAND", "Pine Island",
			"PINELAND", "Pineland",
			"SANIBEL", "Sanibel",
			"CAPE CORAL", "Cape Coral"
		];

		let data;
		if (type) {
			data = await prisma.city.findMany({
				where: {
					isFeatured: true,
					name: {
						in: allowedNames,
					},
				},
				include: {
					_count: { select: { communities: true } }, // show community count per city
				  },
				orderBy: {
					name: "desc",
				},
				take: limit,
			});
		} else {
			data = await prisma.city.findMany({
				where: {
					name: {
						in: allowedNames,
					},
				},
				include: {
					_count: { select: { communities: true } }, // show community count per city
				  },
				orderBy: {
					name: "desc",
				},
				take: limit,
			});
		}

		const response = { success: true, data };

		// ----- SAVE TO CACHE (5 minutes) -----
		await redisSet(cacheKey, JSON.stringify(response), 86400);

		return NextResponse.json(response);
	} catch (error: any) {
		console.error("Error in GET /api/v2/cities:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", message: error.message, stack: error.stack },
			{ status: 500 }
		);
	}
}
