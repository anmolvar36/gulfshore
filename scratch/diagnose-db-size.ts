import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
	try {
		console.log("Analyzing database size for 'gulfshoregroup'...");
		
		// Run a raw SQL query to get table sizes and row counts from information_schema
		const result = await prisma.$queryRawUnsafe<any[]>(`
			SELECT 
				table_name AS tableName, 
				round((data_length / 1024 / 1024), 2) AS dataSizeMB,
				round((index_length / 1024 / 1024), 2) AS indexSizeMB,
				round(((data_length + index_length) / 1024 / 1024), 2) AS totalSizeMB,
				table_rows AS rowCount
			FROM information_schema.TABLES 
			WHERE table_schema = 'gulfshoregroup'
			ORDER BY totalSizeMB DESC
		`);
		
		console.log("\nDATABASE TABLE SIZES & ROW COUNTS:\n");
		console.log(String("").padEnd(100, "="));
		console.log(
			"Table Name".padEnd(30) + 
			" | Row Count".padEnd(15) + 
			" | Data (MB)".padEnd(15) + 
			" | Index (MB)".padEnd(15) + 
			" | Total (MB)"
		);
		console.log(String("").padEnd(100, "="));
		
		let grandTotalSize = 0;
		for (const row of result) {
			console.log(
				String(row.tableName).padEnd(30) + " | " +
				String(row.rowCount).padStart(12) + " | " +
				String(row.dataSizeMB).padStart(13) + " | " +
				String(row.indexSizeMB).padStart(13) + " | " +
				String(row.totalSizeMB).padStart(10)
			);
			grandTotalSize += Number(row.totalSizeMB);
		}
		console.log(String("").padEnd(100, "="));
		console.log(`GRAND TOTAL SIZE: ${grandTotalSize.toFixed(2)} MB\n`);
		
	} catch (error) {
		console.error("Error analyzing database:", error);
	} finally {
		await prisma.$disconnect();
	}
}

main();
