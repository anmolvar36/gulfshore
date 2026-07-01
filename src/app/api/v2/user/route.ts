import connectDB from "@/lib/dbconfig";
import SavedSearch from "@/models/saved-search";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		connectDB();
		const users = await SavedSearch.find({
			user: "680c0e7a167f31811ab39db4",
		});
		return NextResponse.json({ success: true, users });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
