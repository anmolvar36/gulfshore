import { NextResponse } from "next/server";
import Lead from "@/models/leads";
import connectDB from "@/lib/dbconfig";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		await connectDB();
		const body = await req.json();
		const {
			firstName,
			lastName,
			email,
			phone,
			message,
			propertyAddress,
			MLSNumber,
			date,
			propertyId,
		} = body;

		if (!email || !phone)
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 }
			);

		const resolvedName = `${firstName || ""} ${lastName || ""}`.trim() || "Unknown User";
		const resolvedFirstName = firstName || "";
		const resolvedLastName = lastName || "";

		// 1. Create or update Lead in SQL
		const sqlLead = await prisma.lead.upsert({
			where: { email },
			update: {
				firstName: resolvedFirstName,
				lastName: resolvedLastName,
				phone: phone || undefined,
			},
			create: {
				firstName: resolvedFirstName,
				lastName: resolvedLastName,
				email,
				phone: phone || undefined,
				status: "New",
				source: "Tour_Request",
			},
		});

		// 2. Create Inquiry in SQL linked to the Lead
		await prisma.inquiry.create({
			data: {
				leadId: sqlLead.id,
				type: "Tour_Request",
				message: message || `Scheduled a tour for property ${propertyAddress || propertyId || ""}`,
				propertyId: propertyId || undefined,
			},
		});

		// 3. Create ScheduleTour in SQL
		const sqlTour = await prisma.scheduleTour.create({
			data: {
				email,
				name: resolvedName,
				date: date ? new Date(date) : new Date(),
				phone,
				message: message || "",
				status: "Pending",
				propertyId: propertyId || "",
			},
		});

		// 4. Fallback: Save to MongoDB for backward compatibility
		try {
			await Lead.findOneAndUpdate(
				{ email },
				{
					$setOnInsert: {
						firstName,
						lastName,
						email,
						phone,
						source: "Tour_Request",
						status: "New",
						createdAt: new Date(),
					},
					$push: {
						inquiryHistory: {
							inquiryType: "Schedule_Tour",
							message: message || "",
							propertyAddress: propertyAddress || "",
							MLSNumber: MLSNumber || "",
						},
					},
					$set: {
						lastContactedAt: new Date(),
					},
				},
				{ new: true, upsert: true, setDefaultsOnInsert: true }
			);
		} catch (mongoErr) {
			console.error("Failed to save tour to MongoDB, continuing with SQL: ", mongoErr);
		}

		return NextResponse.json({ success: true, lead: sqlLead, tour: sqlTour });
	} catch (err: any) {
		console.error(err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
