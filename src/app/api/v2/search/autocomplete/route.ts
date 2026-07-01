import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const q = searchParams.get("q")?.trim();

		if (!q || q.length < 2) {
			return NextResponse.json({ suggestions: [] });
		}

		const properties = await prisma.property.findMany({
			where: {
				OR: [
					{ City: { contains: q, mode: "insensitive" } },
					{ Community: { contains: q, mode: "insensitive" } },
					{ PostalCode: { contains: q } },
					{ MLSNumber: { contains: q } },
					{ FullAddress: { contains: q, mode: "insensitive" } },
				],
			},
			select: {
				City: true,
				Community: true,
				PostalCode: true,
				MLSNumber: true,
				FullAddress: true,
			},
			take: 10, // fetch a bit more, trim later
		});

		const suggestionsMap = new Map<string, any>();

		for (const p of properties) {
			// CITY
			if (
				p.City &&
				p.City.toLowerCase().includes(q.toLowerCase()) &&
				!suggestionsMap.has(`city-${p.City}`)
			) {
				suggestionsMap.set(`city-${p.City}`, {
					text: p.City,
					type: "city",
				});
			}

			// COMMUNITY
			if (
				p.Community &&
				p.Community.toLowerCase().includes(q.toLowerCase()) &&
				!suggestionsMap.has(`community-${p.Community}`)
			) {
				suggestionsMap.set(`community-${p.Community}`, {
					text: p.Community,
					type: "community",
					city: p.City ?? undefined,
				});
			}

			// ZIPCODE
			if (
				p.PostalCode &&
				p.PostalCode.includes(q) &&
				!suggestionsMap.has(`zip-${p.PostalCode}`)
			) {
				suggestionsMap.set(`zip-${p.PostalCode}`, {
					text: p.PostalCode,
					type: "zipcode",
				});
			}

			// MLS
			if (
				p.MLSNumber &&
				p.MLSNumber.includes(q) &&
				!suggestionsMap.has(`mls-${p.MLSNumber}`)
			) {
				suggestionsMap.set(`mls-${p.MLSNumber}`, {
					text: p.MLSNumber,
					type: "mls",
					MLSNumber: p.MLSNumber,
				});
			}

			// FULL ADDRESS
			if (
				p.FullAddress &&
				p.FullAddress.toLowerCase().includes(q.toLowerCase()) &&
				!suggestionsMap.has(`address-${p.FullAddress}`)
			) {
				suggestionsMap.set(`address-${p.FullAddress}`, {
					text: p.FullAddress,
					type: "address",
					city: p.City ?? undefined,
					community: p.Community ?? undefined,
				});
			}

			if (suggestionsMap.size >= 5) break;
		}

		const suggestions = Array.from(suggestionsMap.values()).slice(
			0,
			5
		);

		return NextResponse.json({ suggestions });
	} catch (error) {
		console.error("Search suggestion error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch suggestions" },
			{ status: 500 }
		);
	}
}
