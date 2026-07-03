import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { redisGet, redisSet } from "@/lib/safeRedis";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ city: string }> }
) {
	try {
		const { city } = await params;
		const cityName = city.trim().toLowerCase();

		// Create a unique cache key
		const cacheKey = `communities:${cityName}`;

		// 1. Check Cache
		const cached = await redisGet(cacheKey);
		if (typeof cached === "string") {
			return NextResponse.json({
				success: true,
				data: JSON.parse(cached),
				cached: true,
			});
		}

		const res = await prisma.community.findMany({
			where: {
				city: {
					OR: [
						{ slug: { equals: cityName } },
						{ name: { equals: cityName.replaceAll("-", " ") } },
					],
				},
			},
			select: {
				name: true,
			},
		});

		// 3. Save to Redis (1 day)
		await redisSet(cacheKey, JSON.stringify(res), 86400);

		return NextResponse.json({
			success: true,
			data: res,
			cached: false,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
