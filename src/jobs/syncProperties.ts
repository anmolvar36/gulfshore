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
	const today = new Date().toISOString().split("T")[0];
	const datetime = date || today;
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
			await prisma.property.upsert({
				where: {
					ListingId: item.ListingId,
				},
				update: mapProperty(item),
				create: mapProperty(item),
			});
		}

		totalFetched += listings.length;
		offset += BATCH_SIZE;

		console.log(`Synced ${totalFetched} properties`);

		if (listings.length < BATCH_SIZE) break;
	}

	console.log("Bridge sync completed");
}
