import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const { userId } = await auth();

		const body = await request.json();
		const { name, firstName, lastName, email, message, phone, ref, refType, userRole = "Buyer" } = body;

		const resolvedName = name || `${firstName || ""} ${lastName || ""}`.trim() || "Unknown User";
		const resolvedFirstName = firstName || name?.split(" ")[0] || "";
		const resolvedLastName = lastName || name?.split(" ").slice(1).join(" ") || "";
		const resolvedRefType = userRole === "Seller" ? "Seller-Inquiry" : userRole === "Buyer" ? "Buyer-Inquiry" : refType || "Contact-Form";
		const tagToApply = userRole === "Seller" ? "Seller" : "Buyer";

		const existingReq = await prisma.contactRequest.findFirst({
			where: {
				email,
				status: {
					in: ["New Request", "Email Sent"],
				},
			},
		});

		if (existingReq) {
			return NextResponse.json({
				message:
					"We’re already processing your earlier request. We’ll update you soon.",
				success: true,
				data: {},
			});
		}

		// 1. Fetch existing lead to preserve tags
		const existingLead = await prisma.lead.findUnique({
			where: { email },
			select: { id: true, tags: true },
		});

		let mergedTags: string[] = [tagToApply];
		if (existingLead && existingLead.tags) {
			try {
				const currentTags = typeof existingLead.tags === "string"
					? JSON.parse(existingLead.tags)
					: (existingLead.tags as string[]);
				if (Array.isArray(currentTags)) {
					mergedTags = Array.from(new Set([...currentTags, tagToApply]));
				}
			} catch (e) {
				console.error("Error parsing tags:", e);
			}
		}

		// 2. Create or update Lead in SQL
		const lead = await prisma.lead.upsert({
			where: { email },
			update: {
				firstName: resolvedFirstName,
				lastName: resolvedLastName,
				phone: phone || undefined,
				tags: mergedTags,
			},
			create: {
				firstName: resolvedFirstName,
				lastName: resolvedLastName,
				email,
				phone: phone || undefined,
				status: "New",
				source: "Contact_Form",
				tags: mergedTags,
			},
		});

		// Map to valid Prisma InquiryType enum (Contact_Form, Tour_Request, General, Home_Valuation)
		let inquiryTypeEnum: "Contact_Form" | "Tour_Request" | "General" | "Home_Valuation" = "Contact_Form";
		if (userRole === "Seller" || refType === "Home_Valuation") {
			inquiryTypeEnum = "Home_Valuation";
		} else if (refType === "Tour_Request") {
			inquiryTypeEnum = "Tour_Request";
		} else {
			inquiryTypeEnum = "Contact_Form";
		}

		// 3. Create Inquiry in SQL linked to the Lead
		await prisma.inquiry.create({
			data: {
				leadId: lead.id,
				type: inquiryTypeEnum,
				message: message || "",
			},
		});


		// 4. Create ContactRequest in SQL
		const newReq = await prisma.contactRequest.create({
			data: {
				user: userId || "",
				name: resolvedName,
				email,
				message: message || "",
				phone,
				status: "New Request",
				ref,
				refType: resolvedRefType,
			},
		});


		return NextResponse.json({ success: true, data: newReq });
	} catch (error: any) {
		console.error("Error saving contact request:", error);
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {

		const requests = await prisma.contactRequest.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});
		const totalRequests = await prisma.contactRequest.count();

		// Map to match Mongoose shape
		const mappedRequests = requests.map((r) => ({
			...r,
			_id: r.id,
		}));

		const res = {
			totalRequests,
			requests: mappedRequests,
		};

		return NextResponse.json({ success: true, data: res });
	} catch (error: any) {
		console.error("Error fetching contact requests:", error);
		return NextResponse.json(
			{ success: false, error: "Internal Server Error", details: error.message },
			{ status: 500 }
		);
	}
}
