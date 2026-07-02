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
		console.log("Starting database optimization migration...");
		console.log("Counting total properties in the database...");
		const totalCount = await prisma.property.count();
		console.log(`Total properties found: ${totalCount}`);

		const batchSize = 100;
		let offset = 0;
		let updatedCount = 0;

		while (offset < totalCount) {
			console.log(`Fetching properties ${offset} to ${offset + batchSize}...`);
			const properties = await prisma.property.findMany({
				select: {
					id: true,
					raw: true,
				},
				skip: offset,
				take: batchSize,
			});

			if (properties.length === 0) break;

			const updates: Promise<any>[] = [];

			for (const prop of properties) {
				const rawObj = prop.raw as any;

				if (rawObj) {
					// Extract only the fields used in the codebase or keep it minimal
					const filteredRaw = {
						PublicRemarks: rawObj.PublicRemarks ?? null,
						ExteriorFeatures: rawObj.ExteriorFeatures ?? null,
						InteriorFeatures: rawObj.InteriorFeatures ?? null,
						Appliances: rawObj.Appliances ?? null,
						Flooring: rawObj.Flooring ?? null,
						Heating: rawObj.Heating ?? null,
						Cooling: rawObj.Cooling ?? null,
						NABOR_MandatoryHOAYN: rawObj.NABOR_MandatoryHOAYN ?? null,
						NABOR_HOAFee: rawObj.NABOR_HOAFee ?? null,
						NABOR_HOAFeeFrequency: rawObj.NABOR_HOAFeeFrequency ?? null,
						NABOR_MasterHOAFee: rawObj.NABOR_MasterHOAFee ?? null,
						NABOR_MasterHOAFeeFrequency: rawObj.NABOR_MasterHOAFeeFrequency ?? null,
						TaxAnnualAmount: rawObj.TaxAnnualAmount ?? null,
						MLSAreaMajor: rawObj.MLSAreaMajor ?? null,
						ListOfficeName: rawObj.ListOfficeName ?? null,
						HighSchool: rawObj.HighSchool ?? null,
						MiddleSchool: rawObj.MiddleSchool ?? null,
						ElementarySchool: rawObj.ElementarySchool ?? null,
						VirtualTourThumbnail: rawObj.VirtualTourThumbnail ?? null,
					};

					// Push update promise to array
					updates.push(
						prisma.property.update({
							where: { id: prop.id },
							data: {
								raw: filteredRaw as any,
							},
						})
					);
					updatedCount++;
				}
			}

			// Run updates in parallel for current batch
			await Promise.all(updates);

			offset += batchSize;
			console.log(`Processed: ${updatedCount} / ${totalCount} properties.`);
		}

		console.log("\nFinished updating all property raw columns.");
		console.log("Reclaiming disk space by running OPTIMIZE TABLE properties...");
		
		// Run table optimization query to shrink physical file size in MariaDB/MySQL
		await prisma.$executeRawUnsafe("OPTIMIZE TABLE properties;");
		console.log("Disk space optimization complete!");
		
	} catch (error) {
		console.error("Migration failed with error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

main();
