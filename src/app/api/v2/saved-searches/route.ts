import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbconfig";
import SavedSearch from "@/models/saved-search";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/user";

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "userId is required" },
				{ status: 400 }
			);
		}

		const user = await User.findOne({
			clerkId: userId,
		});

		if (!userId) {
			return NextResponse.json(
				{ error: "userId is required" },
				{ status: 400 }
			);
		}

		const searches = await SavedSearch.find({ user: user?._id }).sort(
			{
				createdAt: -1,
			}
		);

		return NextResponse.json(searches);
	} catch (error) {
		console.error("Error fetching saved searches:", error);
		return NextResponse.json(
			{ error: "Failed to fetch saved searches" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();
		const { link, filters, name } = body;

		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "userId is required" },
				{ status: 400 }
			);
		}

		const user = await User.findOne({
			clerkId: userId,
		});
		const existingSaved = await SavedSearch.findOne({
			user: user?._id,
			link,
		});
		if (existingSaved) {
			return NextResponse.json(existingSaved, { status: 201 });
		}

		const savedSearch = new SavedSearch({
			user: user?._id,
			name,
			link,
			filters,
		});

		await savedSearch.save();

		return NextResponse.json(savedSearch, { status: 201 });
	} catch (error) {
		console.error("Error creating saved search:", error);
		return NextResponse.json(
			{ error: "Failed to create saved search" },
			{ status: 500 }
		);
	}
}
