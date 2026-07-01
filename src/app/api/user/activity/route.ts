import User from "@/models/user";
import UserSearchQuery from "@/models/userSearchedQuery";
import UserViewedProperty from "@/models/userViewedProperties";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbconfig";
export async function POST(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		const { type, data } = body;

		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({
				success: false,
				message: "User not logged in",
			});
		}

		const user = await User.findOne({ clerkId: userId });
		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 }
			);
		}

		if (type === "search") {
			const existingSearch = await UserSearchQuery.findOne({
				user: user._id,
				searchQuery: data,
			});

			if (existingSearch) {
				await UserSearchQuery.findByIdAndUpdate(existingSearch._id, {
					$inc: { searchCount: 1 },
				});
			} else {
				// create a new search entry
				await UserSearchQuery.create({
					user: user._id,
					searchQuery: data,
					searchCount: 1,
				});

				// enforce max 30 searches → delete oldest if exceeded
				const totalSearches = await UserSearchQuery.countDocuments({
					user: user._id,
				});

				if (totalSearches > 30) {
					const oldest = await UserSearchQuery.findOne({
						user: user._id,
					})
						.sort({ createdAt: 1 }) // oldest first
						.limit(1);

					if (oldest) {
						await UserSearchQuery.findByIdAndDelete(oldest._id);
					}
				}
			}
		}

		if (type === "property") {
			const existingView = await UserViewedProperty.findOne({
				user: user._id,
				property: data.id,
			});

			if (existingView) {
				await UserViewedProperty.findByIdAndUpdate(existingView._id, {
					$inc: { viewCount: 1 },
				});
			} else {
				await UserViewedProperty.create({
					user: user._id,
					property: data.id,
					viewCount: 1,
				});
			}
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("Error saving user activity:", error);
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 }
		);
	}
}
