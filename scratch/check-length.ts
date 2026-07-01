import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
	try {
		const property = await prisma.property.findFirst();

		if (!property) {
			console.log("No properties found.");
			return;
		}

		const rawObj = property.raw as any;
		console.log("Fields in raw JSON of property:", property.ListingId);
		console.log(String("").padEnd(50, "-"));
		
		let totalChars = 0;
		for (const key of Object.keys(rawObj)) {
			const val = rawObj[key];
			const valStr = JSON.stringify(val);
			console.log(`${key.padEnd(30)}: ${valStr.length} chars`);
			totalChars += valStr.length;
		}
		
		console.log(String("").padEnd(50, "-"));
		console.log(`Total stringified raw length: ${totalChars} chars`);
		
	} catch (e) {
		console.error(e);
	} finally {
		await prisma.$disconnect();
	}
}

main();
