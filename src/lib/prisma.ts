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

	// In production, Prisma v7 reads DATABASE_URL from env automatically
	return new PrismaClient();
}

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;
export { prisma };
