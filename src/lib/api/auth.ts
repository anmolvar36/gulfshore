import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { Lead } from "@/app/generated/prisma/client";
import { ApiError } from "@/lib/api/errors";

export async function requireClerkUserId(): Promise<string> {
	const { userId } = await auth();
	if (!userId) {
		throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
	}
	return userId;
}

/**
 * Resolves the Prisma Lead row for the authenticated Clerk user.
 * Creates a lead record on first authenticated API call if the webhook has not run yet.
 */
export async function requireLead(): Promise<Lead> {
	const clerkUserId = await requireClerkUserId();

	const existing = await prisma.lead.findUnique({
		where: { userId: clerkUserId },
	});

	if (existing) {
		return existing;
	}

	const user = await currentUser();
	const email =
		user?.emailAddresses?.[0]?.emailAddress ??
		user?.primaryEmailAddress?.emailAddress;

	if (!email) {
		throw new ApiError(
			400,
			"Authenticated user has no email address",
			"MISSING_EMAIL"
		);
	}

	return prisma.lead.upsert({
		where: { email },
		update: { userId: clerkUserId },
		create: {
			userId: clerkUserId,
			email,
			firstName: user?.firstName ?? undefined,
			lastName: user?.lastName ?? undefined,
			fullName:
				[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
				undefined,
			source: "Signup",
			status: "New",
		},
	});
}
