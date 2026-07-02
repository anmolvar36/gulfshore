import { PrismaClient } from "../app/generated/prisma/client";

const globalForPrisma = global as unknown as {
	prisma: PrismaClient;
};

function createPrismaClient() {
	// In local dev, use MariaDB adapter with hardcoded local config
	if (process.env.NEXT_PUBLIC_ENV === "DEV") {
		const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
		const adapter = new PrismaMariaDb({
			host: "127.0.0.1",
			port: 3307,
			user: "root",
			password: "",
			database: "gulfshoregroup",
			connectTimeout: 10000,
			connectionLimit: 10,
			acquireTimeout: 10000,
		} as any);
		return new PrismaClient({ adapter });
	}

	// In production, use standard DATABASE_URL env var
	return new PrismaClient({
		datasourceUrl: process.env.DATABASE_URL,
	});
}

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;
export { prisma };
