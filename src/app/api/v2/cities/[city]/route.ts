import connectDB from "@/lib/dbconfig";
import City from "@/models/city";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ city: string }> }
) {
	try {
		const { city } = await params;
		const cityName = city.trim().toUpperCase();
		await connectDB();
		const res = await City.findOne({
			City: cityName,
		});
		return NextResponse.json({ success: true, data: res });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
