import connectDB from "@/lib/dbconfig";
import Leads from "@/models/leads";
import { NextResponse } from "next/server";

interface Params {
	params: { id: string };
}

export async function POST(req: Request, { params }: Params) {
	try {
		await connectDB();
		const { propertyId, propertyAddress, inquiryType, message } =
			await req.json();

		if (!propertyId || !propertyAddress || !inquiryType)
			return NextResponse.json(
				{ error: "Missing fields" },
				{ status: 400 }
			);

		const lead = await Leads.findById(params.id);
		if (!lead)
			return NextResponse.json(
				{ error: "Lead not found" },
				{ status: 404 }
			);

		lead.inquiryHistory.push({
			propertyId,
			propertyAddress,
			inquiryType,
			message,
			createdAt: new Date(),
		});
		await lead.save();

		return NextResponse.json(lead);
	} catch (error) {
		console.error("Error adding inquiry:", error);
		return NextResponse.json(
			{ error: "Failed to add inquiry" },
			{ status: 500 }
		);
	}
}
