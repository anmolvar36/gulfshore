import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const userRecord = await prisma.lead.findUnique({
			where: { id },
		});

		const user = userRecord ? {
			...userRecord,
			_id: userRecord.id,
			clerkId: userRecord.userId,
			name: userRecord.fullName || `${userRecord.firstName || ""} ${userRecord.lastName || ""}`.trim() || "Unknown User",
			profileImage: "",
			isActive: true,
			propertyCriteria: (userRecord.tags as any)?.propertyCriteria || [],
		} : null;

		if (user) {
			const [
				searchHistory,
				viewed,
				wishlist,
				savedSearch,
			] = await Promise.all([
				prisma.userSearchQuery.findMany({
					where: { userId: id },
					orderBy: { lastSearched: "desc" },
				}),

				prisma.userViewedProperty.findMany({
					where: { userId: id },
					orderBy: { lastViewed: "desc" },
				}),

				prisma.wishlist.findMany({
					where: { userId: id },
					orderBy: { createdAt: "desc" },
				}),

				prisma.savedSearch.findMany({
					where: { userId: id },
					orderBy: { createdAt: "desc" },
				}),
			]);

			// Resolve property details for viewed properties
			const viewedPropertyIds = viewed.map((v) => v.propertyId);
			const viewedPropertiesData = await prisma.property.findMany({
				where: { id: { in: viewedPropertyIds } },
				select: {
					id: true,
					FullAddress: true,
					City: true,
					ListPrice: true,
					Development: true,
					MLSNumber: true,
				},
			});

			const viewedProperties = viewed.map((v) => {
				const prop = viewedPropertiesData.find((p) => p.id === v.propertyId);
				return {
					id: v.id,
					userId: v.userId,
					propertyId: v.propertyId,
					viewCount: v.viewCount,
					lastViewed: v.lastViewed,
					createdAt: v.createdAt,
					updatedAt: v.updatedAt,
					property: prop
						? {
								_id: prop.id,
								PropertyAddress: prop.FullAddress,
								City: prop.City,
								CurrentPrice: prop.ListPrice || 0,
								Development: prop.Development || "",
								MLSNumber: prop.MLSNumber,
						  }
						: null,
				};
			});

			// Resolve property details for wishlist properties
			const wishlistPropertyIds = wishlist.map((w) => w.propertyId);
			const wishlistPropertiesData = await prisma.property.findMany({
				where: { id: { in: wishlistPropertyIds } },
				select: {
					id: true,
					FullAddress: true,
					City: true,
					ListPrice: true,
					Development: true,
					MLSNumber: true,
				},
			});

			const wishlistProperties = wishlist.map((w) => {
				const prop = wishlistPropertiesData.find((p) => p.id === w.propertyId);
				return {
					id: w.id,
					userId: w.userId,
					propertyId: w.propertyId,
					createdAt: w.createdAt,
					updatedAt: w.updatedAt,
					property: prop
						? {
								_id: prop.id,
								PropertyAddress: prop.FullAddress,
								City: prop.City,
								CurrentPrice: prop.ListPrice || 0,
								Development: prop.Development || "",
								MLSNumber: prop.MLSNumber,
						  }
						: null,
				};
			});

			return NextResponse.json({
				success: true,
				data: {
					user,
					searchHistory,
					viewedProperties,
					wishlistProperties,
					savedSearch,
				},
			});
		}

		return NextResponse.json({
			success: false,
			message: "No User Found",
		});
	} catch (error) {
		console.error("Error fetching user dashboard data:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
