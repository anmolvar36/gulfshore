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
	const [
		leads,
		users,
		contactRequests,
		tours,
		wishlists,
		viewedProperties,
		savedProperties,
	] = await Promise.all([
		prisma.lead.count(),
		prisma.lead.count({ where: { userId: { not: null } } }),
		prisma.contactRequest.count(),
		prisma.scheduleTour.count(),
		prisma.wishlist.count(),
		prisma.userViewedProperty.count(),
		prisma.savedProperty.count(),
	]);

	console.log("=== Dashboard Stats from DB ===");
	console.log("Total Leads:           ", leads);
	console.log("Total Users (w/userId):", users);
	console.log("Contact Requests:      ", contactRequests);
	console.log("Tour Requests:         ", tours);
	console.log("Wishlists:             ", wishlists);
	console.log("Viewed Properties:     ", viewedProperties);
	console.log("Saved Properties:      ", savedProperties);

	// Check if Lead table has user data
	const sampleLeads = await prisma.lead.findMany({ take: 3, select: { id: true, email: true, source: true, userId: true } });
	console.log("\nSample Leads:", JSON.stringify(sampleLeads, null, 2));

	await prisma.$disconnect();
}

main().catch(console.error);
