import { NextResponse } from "next/server";
import Lead from "@/models/leads";
import connectDB from "@/lib/dbconfig";

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string; criteriaId: string } }
) {
	await connectDB();
	const { id, criteriaId } = await params;

	const lead = await Lead.findById(id);
	if (!lead)
		return NextResponse.json(
			{ message: "Lead not found" },
			{ status: 404 }
		);

	lead.propertyCriteria = lead.propertyCriteria.filter(
		(criteria: any) => criteria._id.toString() !== criteriaId
	);
	await lead.save();

	return NextResponse.json(lead);
}
