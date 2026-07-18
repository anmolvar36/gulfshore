import prisma from "../lib/prisma";
import { fetchBridgeBatch } from "@/lib/bridge";
import { mapProperty } from "../lib/mapProperty";

const BATCH_SIZE = 200;
const DB_CHUNK_SIZE = 50; // Process DB writes in smaller chunks to avoid connection exhaustion
const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep helper
 */
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Upsert a single property with retry logic.
 * Uses ListingKey as the unique identifier for upsert.
 * Falls back to updateMany + create if the standard upsert hits a constraint
 * conflict caused by the secondary unique key (ListingId).
 */
async function upsertPropertyWithRetry(item: any): Promise<void> {
	const mapped = mapProperty(item);

	for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
		try {
			// Try standard Prisma upsert first
			await prisma.property.upsert({
				where: { ListingKey: item.ListingKey },
				update: mapped,
				create: mapped,
			});
			return; // success
		} catch (err: any) {
			const msg: string = err?.message ?? "";

			// --- Handle: unique constraint on ListingId (secondary unique key conflict) ---
			// This happens when a property already exists with this ListingId but a DIFFERENT ListingKey
			if (
				msg.includes("Unique constraint") &&
				msg.includes("ListingId") &&
				attempt === 1
			) {
				try {
					// Find and update by ListingId, then handle if ListingKey also exists separately
					const existingByListingId = await prisma.property.findUnique({
						where: { ListingId: item.ListingId },
						select: { id: true, ListingKey: true },
					});

					if (existingByListingId) {
						// Update the existing record using its internal id
						await prisma.property.update({
							where: { id: existingByListingId.id },
							data: mapped,
						});
						return;
					}
				} catch (innerErr: any) {
					console.error(
						`[Sync] Fallback update failed for ${item.ListingId}: ${innerErr?.message}`
					);
				}
				// Don't retry further for this type of error
				return;
			}

			// --- Handle: transaction/connection errors — retry with back-off ---
			if (
				msg.includes("Transaction already closed") ||
				msg.includes("connection closed") ||
				msg.includes("ECONNRESET") ||
				msg.includes("ER_CON_COUNT_ERROR")
			) {
				if (attempt < RETRY_LIMIT) {
					const delay = RETRY_DELAY_MS * attempt;
					console.warn(
						`[Sync] Connection error for ${item.ListingId} (attempt ${attempt}/${RETRY_LIMIT}), retrying in ${delay}ms...`
					);
					await sleep(delay);
					continue;
				}
			}

			// Final attempt failed or unrecognized error
			if (attempt === RETRY_LIMIT) {
				console.error(
					`[Sync] Failed to sync property ${item.ListingId} after ${RETRY_LIMIT} attempts: ${msg}`
				);
			} else if (attempt === 1) {
				// Unknown error on first attempt — log and skip
				console.error(
					`[Sync] Failed to sync property ${item.ListingId}: ${msg}`
				);
				return;
			}
		}
	}
}

/**
 * Process a chunk of listings sequentially to avoid overwhelming the connection pool.
 */
async function processChunk(
	listings: any[],
	chunkIndex: number
): Promise<{ success: number; failed: number }> {
	let success = 0;
	let failed = 0;

	for (const item of listings) {
		try {
			await upsertPropertyWithRetry(item);
			success++;
		} catch {
			failed++;
		}
	}

	return { success, failed };
}

export async function syncTodaysActiveProperties({
	count,
	date,
}: {
	count: number;
	date?: string;
}) {
	let offset = count || 0;
	let totalFetched = 0;
	let totalSuccess = 0;
	let totalFailed = 0;

	// Fetch from 3 days ago by default to prevent missing any listings
	const threeDaysAgo = new Date();
	threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
	const defaultDate = threeDaysAgo.toISOString().split("T")[0];
	const datetime = date || defaultDate;

	console.log(`[Sync] Starting Bridge sync from: ${datetime}, offset: ${offset}`);

	while (true) {
		// --- Fetch batch from Bridge API ---
		let data: any;
		try {
			data = await fetchBridgeBatch(offset, BATCH_SIZE, datetime, "Active");
		} catch (fetchErr: any) {
			console.error(`[Sync] Bridge API fetch failed at offset ${offset}: ${fetchErr?.message}`);
			break;
		}

		const listings: any[] = data.bundle || [];
		if (listings.length === 0) break;

		// --- Write to DB in smaller sub-chunks to protect the connection pool ---
		for (let i = 0; i < listings.length; i += DB_CHUNK_SIZE) {
			const chunk = listings.slice(i, i + DB_CHUNK_SIZE);
			const chunkIndex = Math.floor(i / DB_CHUNK_SIZE);
			const { success, failed } = await processChunk(chunk, chunkIndex);
			totalSuccess += success;
			totalFailed += failed;

			// Brief pause between DB chunks to let the connection pool breathe
			if (i + DB_CHUNK_SIZE < listings.length) {
				await sleep(100);
			}
		}

		totalFetched += listings.length;
		offset += BATCH_SIZE;

		console.log(
			`[Sync] Batch complete — fetched: ${totalFetched}, success: ${totalSuccess}, failed: ${totalFailed}`
		);

		if (listings.length < BATCH_SIZE) break;

		// Brief pause between Bridge API batches
		await sleep(200);
	}

	console.log(
		`[Sync] Bridge sync completed. Total fetched: ${totalFetched}, success: ${totalSuccess}, failed: ${totalFailed}`
	);
}
