import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Cache the result for 60 seconds to avoid repeated heavy DB calls
let cache: { data: any; ts: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function GET() {
	try {
		// Return cached result if still fresh
		if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
			return NextResponse.json({ success: true, data: cache.data });
		}

		const [
			totalCities,
			totalCommunities,
			totalContacts,
			totalProperties,
			totalTours,
			totalUsers,
			totalWishlistedProperties,
			totalPropertyViews
		] = await Promise.all([
			prisma.city.count(),
			prisma.community.count(),
			prisma.contactRequest.count(),
			prisma.property.count(),
			prisma.scheduleTour.count(),
			prisma.lead.count({
				where: {
					userId: {
						not: null,
					},
				},
			}),
			prisma.savedProperty.count(),
			prisma.viewedProperty.count()
		]);

		const res = {
			TotalCities: totalCities,
			TotalCommunities: totalCommunities,
			TotalContacts: totalContacts,
			TotalProperties: totalProperties,
			TotalTours: totalTours,
			TotalSocialLogs: 0,
			TotalUsers: totalUsers,
			TotalWishlistedProperties: totalWishlistedProperties,
			TotalPropertyViews: totalPropertyViews,
			LastSocialMediaUploadTime: new Date().toISOString()
		};

		// Store in cache
		cache = { data: res, ts: Date.now() };

		return NextResponse.json({ success: true, data: res });
	} catch (error: any) {
		console.error("Error fetching admin dashboard totals:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
