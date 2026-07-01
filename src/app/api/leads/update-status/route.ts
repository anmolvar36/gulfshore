import connectDB from "@/lib/dbconfig";
import Leads from "@/models/leads";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
	try {
		await connectDB();
		const { id, status } = await req.json();

		if (!id || !status)
			return NextResponse.json(
				{ error: "ID and status required" },
				{ status: 400 }
			);

		const lead = await Leads.findById(id);
		if (!lead)
			return NextResponse.json(
				{ error: "Lead not found" },
				{ status: 404 }
			);

		lead.status = status;
		lead.lastContactedAt = new Date();
		await lead.save();

		return NextResponse.json(lead);
	} catch (error) {
		console.error("Error updating status:", error);
		return NextResponse.json(
			{ error: "Failed to update lead status" },
			{ status: 500 }
		);
	}
}
