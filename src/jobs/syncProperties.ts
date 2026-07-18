import prisma from "../lib/prisma";
import { fetchBridgeBatch } from "@/lib/bridge";
import { mapProperty } from "../lib/mapProperty";

const BATCH_SIZE = 200;

export async function syncTodaysActiveProperties({
	count,
	date,
}: {
	count: number;
	date?: string;
}) {
	let offset = count || 0;
	let totalFetched = 0;
	
	// Fetch from 3 days ago by default to prevent missing any listings
	const threeDaysAgo = new Date();
	threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
	const defaultDate = threeDaysAgo.toISOString().split("T")[0];
	const datetime = date || defaultDate;
	
	while (true) {
		const data = await fetchBridgeBatch(
			offset,
			BATCH_SIZE,
			datetime,
			"Active"
		);
		const listings = data.bundle || [];

		if (listings.length === 0) break;

		for (const item of listings) {
			try {
				await prisma.property.upsert({
					where: {
						ListingId: item.ListingId,
					},
					update: mapProperty(item),
					create: mapProperty(item),
				});
			} catch (err: any) {
				console.error(`Failed to sync property ${item.ListingId}: ${err.message || 'Unknown error'}`);
			}
		}

		totalFetched += listings.length;
		offset += BATCH_SIZE;

		console.log(`Synced ${totalFetched} properties`);

		if (listings.length < BATCH_SIZE) break;
	}

	console.log("Bridge sync completed");
}
