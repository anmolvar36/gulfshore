import connectDB from "@/lib/dbconfig";
import Community from "@/models/community";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const queryParams = req.nextUrl.searchParams;

		const limit = Number(queryParams.get("limit")) || 20;

		await connectDB();

		const res = await Community.find()
			.sort({ index: -1 })
			.limit(limit);

		return NextResponse.json({ success: true, data: res });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
