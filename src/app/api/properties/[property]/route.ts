import connectDB from "@/lib/dbconfig";
import Property from "@/models/property";
import User from "@/models/user";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ property: string }> }
) {
	try {
		const { property } = await params;
		const { userId } = await auth();

		const propertyAddress = decodeURIComponent(property)
			.trim()
			.replaceAll(/\s+/g, "-")
			.replace("-Fl-", "-FL-");

		await connectDB();

		if (userId) {
			const user = await User.findOne({
				clerkId: userId,
			});
			const uid =
				user?._id instanceof Types.ObjectId
					? user._id
					: new Types.ObjectId(user?._id as string);
			const res = await Property.aggregate([
				{
					$match: {
						PropertySearchSlug: propertyAddress,
					},
				},

				{
					$lookup: {
						from: "wishlists",
						let: { propertyId: "$_id" },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $eq: ["$property", "$$propertyId"] },
											{ $eq: ["$user", uid] },
										],
									},
								},
							},
						],
						as: "wishlistInfo",
					},
				},
			]).limit(1);

			if (!res.length) {
				return NextResponse.json(
					{ error: "Property Not Found" },
					{ status: 404 }
				);
			}

			return NextResponse.json({ success: true, data: res[0] });
		}

		const res = await Property.find({
			PropertySearchSlug: propertyAddress,
		})
			.limit(1)
			.lean();
		if (!res.length) {
			return NextResponse.json(
				{ error: "Property Not Found" },
				{ status: 404 }
			);
		}

		const similar: string[] = await Property.find({
			Status: "Active",
			City: res[0].City,
			DevelopmentName: res[0].DevelopmentName,
			_id: { $ne: res[0]._id },
		})
			.select(
				"slug City DevelopmentName CurrentPrice FullAddress PropertyAddress"
			)
			.limit(9);
		return NextResponse.json({
			success: true,
			data: {
				...res[0],
				similar: similar,
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
