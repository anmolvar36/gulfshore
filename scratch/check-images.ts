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
	try {
		const p = await prisma.property.findFirst({
			select: { raw: true, FullAddress: true, PhotosCount: true }
		});
		const raw = p?.raw as any;
		console.log("Address:", p?.FullAddress);
		console.log("PhotosCount:", p?.PhotosCount);
		console.log("Raw keys:", Object.keys(raw || {}).join(", "));
		// Check for Media in raw
		if (raw?.Media) {
			console.log("\nMedia found in raw! Count:", raw.Media.length);
			console.log("First media:", JSON.stringify(raw.Media[0], null, 2));
		} else {
			console.log("\nNo Media in raw field");
			// Look for any image-related keys
			const imageKeys = Object.keys(raw || {}).filter(k => k.toLowerCase().includes('media') || k.toLowerCase().includes('photo') || k.toLowerCase().includes('image'));
			console.log("Image-related keys:", imageKeys);
		}
	} catch (err) {
		console.error("Error:", err);
	} finally {
		await prisma.$disconnect();
	}
}

main();
