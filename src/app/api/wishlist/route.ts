import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const limit = parseInt(searchParams.get("limit") || "100");
		
		const wishlists = await prisma.wishlist.findMany({
			take: limit,
			orderBy: {
				createdAt: "desc"
			}
		});

		return NextResponse.json({ success: true, data: wishlists });
	} catch (error: any) {
		console.error("Error fetching wishlists:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
