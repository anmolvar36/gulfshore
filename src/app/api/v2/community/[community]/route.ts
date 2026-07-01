import connectDB from "@/lib/dbconfig";
import Community from "@/models/community";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ community: string }> }
) {
	try {
		const { community } = await params;
		const communityName = community.trim().toUpperCase();
		await connectDB();
		const res = await Community.findOne({
			name: communityName,
		});
		return NextResponse.json({ success: true, data: res });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
