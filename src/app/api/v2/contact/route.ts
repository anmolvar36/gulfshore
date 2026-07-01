import connectDB from "@/lib/dbconfig";
import Leads from "@/models/leads";
import { NextResponse } from "next/server";

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
		} = body;

		const lead = await Leads.findOneAndUpdate(
			{ email },
			{
				$push: {
					inquiryHistory: {
						inquiryType: "Contact",
						propertyAddress,
						MLSNumber,
						message,
					},
				},
				$setOnInsert: {
					firstName,
					lastName,
					email,
					phone,
					source: "Contact_Form",
				},
			},
			{ new: true, upsert: true }
		);

		return NextResponse.json({ success: true, lead });
	} catch (err: any) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
