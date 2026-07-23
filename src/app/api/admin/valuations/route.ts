import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		// Fetch Home Valuation contact requests and inquiries
		const [valuationRequests, sellerInquiries] = await Promise.all([
			prisma.contactRequest.findMany({
				where: { refType: "Home_Valuation" },
				orderBy: { createdAt: "desc" },
			}),
			prisma.inquiry.findMany({
				where: { type: "Home_Valuation" },
				orderBy: { createdAt: "desc" },
				include: { Lead: true },
			}),
		]);

		const emails = Array.from(
			new Set([
				...valuationRequests.map((r) => r.email.toLowerCase().trim()),
				...sellerInquiries.map((i) => i.Lead?.email?.toLowerCase().trim()).filter(Boolean),
			])
		) as string[];

		const leads = await prisma.lead.findMany({
			where: { email: { in: emails } },
			select: { id: true, email: true, firstName: true, lastName: true, fullName: true, phone: true },
		});

		const leadMap = new Map(
			leads.map((l) => [
				l.email.toLowerCase().trim(),
				{
					id: l.id,
					name: l.fullName || `${l.firstName || ""} ${l.lastName || ""}`.trim(),
					phone: l.phone || "",
				},
			])
		);

		// Format valuation list
		const formattedValuations = valuationRequests.map((req) => {
			const syncedLead = leadMap.get(req.email.toLowerCase().trim());
			return {
				id: req.id,
				propertyAddress: req.ref && req.ref !== "null" && req.ref !== "N/A" ? req.ref : "Address Provided In Details",
				sellerName: syncedLead?.name || req.name || "Unknown Seller",
				sellerEmail: req.email,
				sellerPhone: syncedLead?.phone || req.phone || "",
				leadId: syncedLead?.id || null,
				status: req.status || "New Request",
				message: req.message || "Home Valuation Estimate Request",
				createdAt: new Date(req.createdAt).toLocaleDateString("en-US", { timeZone: "America/New_York" }),
			};
		});

		return NextResponse.json({ success: true, valuations: formattedValuations });
	} catch (error: any) {
		console.error("Error fetching admin home valuations:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
