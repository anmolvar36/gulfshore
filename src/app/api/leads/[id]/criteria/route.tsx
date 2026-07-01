import { NextResponse } from "next/server";
import Lead from "@/models/leads";
import connectDB from "@/lib/dbconfig";

export async function POST(
	req: Request,
	{ params }: { params: { id: string } }
) {
	await connectDB();
	const id = (await params).id;
	const criteria = await req.json();

	const lead = await Lead.findById(id);
	if (!lead)
		return NextResponse.json(
			{ message: "Lead not found" },
			{ status: 404 }
		);

	lead.propertyCriteria.push(criteria);
	await lead.save();

	return NextResponse.json(lead);
}
