import { NextRequest } from "next/server";
import { syncTodaysActiveProperties } from "@/jobs/syncProperties";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const forceDate = searchParams.get("date");
	const today = new Date().toISOString().split("T")[0];

	const lastFetched = await prisma.property.findMany({
		where: {
			StandardStatus: "Active",
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			createdAt: true,
		},
		take: 1,
	});

	const lastFetchedDate = lastFetched[0]?.createdAt;
	
	// Default to a month ago if database is completely empty
	const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
	
	// Always look back 7 days from last sync date to catch any newly added listings
	const rawDate = forceDate || (lastFetchedDate ? lastFetchedDate.toISOString().split("T")[0] : defaultStartDate);
	const lookbackDate = new Date(new Date(rawDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
	const queryDate = forceDate || lookbackDate;

	// Count matching properties since queryDate
	const count = await prisma.property.count({
		where: {
			StandardStatus: "Active",
			BridgeModificationTimestamp: {
				gte: queryDate,
			},
		},
	});

	console.log(`Starting sync from date: ${queryDate}, count: ${count}`);
	await syncTodaysActiveProperties({ count: 0, date: queryDate });

	return Response.json({ success: true, count, date: queryDate });
}
