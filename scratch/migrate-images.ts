/**
 * One-time migration: Populate the `images` JSON field in all properties
 * using the Media data already stored in the `raw` field.
 * Run: npx tsx scratch/migrate-images.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
	host: "127.0.0.1",
	port: 3307,
	user: "root",
	password: "",
	database: "gulfshoregroup",
} as any);

const prisma = new PrismaClient({ adapter } as any);

async function main() {
	console.log("Starting image migration from raw.Media → images field...");

	const BATCH_SIZE = 200;
	let offset = 0;
	let totalUpdated = 0;
	let totalSkipped = 0;

	while (true) {
		const batch = await prisma.property.findMany({
			where: {
				images: { equals: null as any },
			},
			select: { id: true, raw: true },
			skip: offset,
			take: BATCH_SIZE,
		});

		if (batch.length === 0) break;

		const updates: Promise<any>[] = [];

		for (const p of batch) {
			const raw = p.raw as any;
			if (raw?.Media && Array.isArray(raw.Media) && raw.Media.length > 0) {
				updates.push(
					prisma.property.update({
						where: { id: p.id },
						data: { images: raw.Media },
					})
				);
				totalUpdated++;
			} else {
				totalSkipped++;
			}
		}

		await Promise.all(updates);

		offset += BATCH_SIZE;
		console.log(
			`Processed ${offset} | Updated: ${totalUpdated} | Skipped (no media): ${totalSkipped}`
		);
	}

	console.log("\n✅ Migration complete!");
	console.log(`   Total updated: ${totalUpdated}`);
	console.log(`   Total skipped: ${totalSkipped}`);
	await prisma.$disconnect();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
