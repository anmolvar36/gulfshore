import capitalizeWords from "@/hooks/capitalize-letter";
import { formatPrice } from "@/hooks/formatPrice";
import City from "@/models/city";
import Property from "@/models/property";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbconfig";
interface SearchParams {
	city: string;
	developmentName: string;
	beds: string;
	baths: string;
	minPrice: string;
	maxPrice: string;
	builtYearMin: string;
	builtYearMax: string;
	sort: string;
	order: string;
	propertyTypes: string[];
	postalCode: string;
	page: string;
}

export async function GET(req: NextRequest) {
	try {
		await connectDB();
		const { searchParams } = new URL(req.url);

		const params: SearchParams = {
			city: searchParams.get("city") || "",
			developmentName: searchParams.get("developmentName") || "",
			beds: searchParams.get("beds") || "",
			baths: searchParams.get("baths") || "",
			minPrice: searchParams.get("minPrice") || "",
			maxPrice: searchParams.get("maxPrice") || "",
			builtYearMin: searchParams.get("builtYearMin") || "",
			builtYearMax: searchParams.get("builtYearMax") || "",
			sort: searchParams.get("sort") || "",
			order: searchParams.get("order") || "",
			propertyTypes: searchParams.getAll("propertyTypes"),
			postalCode: searchParams.get("postalCode") || "",
			page: searchParams.get("page") || "1",
		};
		let city = "";
		let community = "";
		if (params.city) {
			const c = params.city || "";
			city =
				capitalizeWords(c.replaceAll(/[^a-zA-Z0-9&]+/g, " ")) || "";
		}
		if (params.developmentName) {
			community =
				capitalizeWords(
					params.developmentName.replaceAll(/[^a-zA-Z0-9&]+/g, " ")
				) || "";
		}
		let total: number = 0;
		let match: any = {};
		let content: any = {};

		const cityPart = params.city
			? ` ${city}, FL Real Estate`
			: " Florida Real Estate";

		const devPart = params.developmentName ? ` ${community},` : "";

		if (params.city) {
			match.City = decodeURIComponent(params.city).toUpperCase();
			content = await City.findOne({
				City: { $regex: new RegExp(params.city!, "i") },
			});
		}
		if (params.developmentName) {
			const Community = decodeURIComponent(
				params.developmentName
			).toUpperCase();
			const regex = new RegExp(`^${Community}$`, "i");

			match.$or = [
				{ Development: regex },
				{ DevelopmentName: regex },
			];
		}

		total = await Property.countDocuments(match).lean();

		const bedBathPart =
			params.beds || params.baths
				? ` with ${params.beds ? params.beds + " Beds" : ""}${
						params.beds && params.baths ? " & " : ""
				  }${params.baths ? params.baths + " Baths" : ""} `
				: "";

		const minPart =
			params.minPrice &&
			params.maxPrice &&
			`Starting From ${formatPrice(parseInt(params.minPrice))} `;
		const maxPart =
			!params.minPrice &&
			params.maxPrice &&
			`Under ${formatPrice(parseInt(params.maxPrice))} `;
		const typePart =
			params.propertyTypes.length > 0 &&
			params.propertyTypes[0].trim()
				? `${params.propertyTypes.join(", ")} For Sale in`
				: "";

		// Title
		const title = `${typePart}${devPart}${cityPart} ${
			!city && !devPart ? "Listings." : ""
		} ${minPart || maxPart || ""}${bedBathPart}- Gulfshore Group`
			.replaceAll("  ", " ")
			.trim();

		// Description
		const description = `Browse ${
			city || "Florida"
		} real estate listings ${typePart}${devPart}${cityPart}${bedBathPart}. Total ${total} Listings in${devPart}${cityPart}.${
			!cityPart && !devPart
				? "Discover homes, condos, and real estate properties available now."
				: ""
		}`
			.replaceAll("  ", " ")
			.trim();

		const heading = `${
			typePart || "Listings in"
		}${devPart}${cityPart}`
			.replaceAll("  ", " ")
			.trim();
		return NextResponse.json({
			title,
			city,
			community,
			description,
			heading,
			content,
			keywords: [
				params.city,
				params.developmentName,
				...params.propertyTypes,
				params.beds ? `${params.beds} bedroom homes` : "",
				params.baths ? `${params.baths} bathroom homes` : "",
				"Florida real estate",
				"homes for sale",
				"condos for sale",
				"Gulfshore Group",
				"Gulfshore Group Florida Real Estate",
			].filter(Boolean),
		});
	} catch (error) {
		return NextResponse.json({}, { status: 500 });
	}
}
