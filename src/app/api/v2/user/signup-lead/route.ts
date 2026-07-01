import { NextResponse } from "next/server";
import Lead from "@/models/leads";
import connectDB from "@/lib/dbconfig";

export async function POST(req: Request) {
	try {
		await connectDB();
		const body = await req.json();
		const { firstName, lastName, email, phone } = body;

		if (!email)
			return NextResponse.json(
				{ success: false, error: "Email is required" },
				{ status: 400 }
			);

		const lead = await Lead.findOneAndUpdate(
			{ email },
			{
				$setOnInsert: {
					firstName,
					lastName,
					email,
					phone,
					source: "Signup",
					status: "New",
					createdAt: new Date(),
				},
				$set: {
					lastContactedAt: new Date(),
				},
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		);

		return NextResponse.json({ success: true, lead });
	} catch (err: any) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 200 }
		);
	}
}
