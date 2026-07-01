import { syncTodaysActiveProperties } from "@/jobs/syncProperties";
import prisma from "@/lib/prisma";

export async function GET() {
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
	
	// Default to a month ago if database is completely empty so we fetch a good initial batch
	const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
	const queryDate = lastFetchedDate ? lastFetchedDate.toISOString().split("T")[0] : defaultStartDate;

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
