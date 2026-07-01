import City from "@/models/city";
import capitalizeWords from "./capitalize-letter";
import { SearchParamsResult } from "./extractSearchParams";
import Property from "@/models/property";
import connectDB from "@/lib/dbconfig";
import { formatPrice } from "./formatPrice";
import UrlMaker from "./url-maker";

export default async function GetSeoData({
	params,
}: {
	params: SearchParamsResult;
}) {
	await connectDB();

	const city = params.city
		? capitalizeWords(params.city.replaceAll(/[^a-zA-Z0-9&]+/g, " "))
		: "";
	const community = params.developmentName
		? capitalizeWords(
				params.developmentName.replaceAll(/[^a-zA-Z0-9&]+/g, " ")
		  )
		: "";

	const match: any = { Status: "Active" };
	let content: any = {};

	// --- City info ---
	if (params.city) {
		match.City = decodeURIComponent(params.city).toUpperCase();
		content = await City.findOne({
			City: { $regex: new RegExp(params.city!, "i") },
		}).lean();
	}

	// --- Community ---
	if (params.developmentName) {
		const regex = new RegExp(
			`^${decodeURIComponent(params.developmentName)}$`,
			"i"
		);
		match.$or = [{ Development: regex }, { DevelopmentName: regex }];
	}

	// --- Total Listings ---
	const total = await Property.countDocuments(match).lean();

	// --- Similar Listings (8 random or latest active) ---
	const page = Number(params.page) || 1;
	let skipNum;
	skipNum = (page + 1) * 18;
	if (skipNum > total) skipNum = 1;
	const similar = await Property.find(match)
		.select(
			"slug City DevelopmentName CurrentPrice FullAddress PropertyAddress Longitude Latitude"
		)
		.skip(skipNum)
		.limit(8)
		.lean();

	// --- Dynamic Segments ---
	const cityPart = city ? `${city}, FL` : "Florida";

	const bedBath =
		params.beds || params.baths
			? ` with ${params.beds || ""}${params.beds ? " bedroom" : ""}${
					params.baths ? ` and ${params.baths} bath` : ""
			  }`
			: "";

	const priceSegment =
		params.minPrice && params.maxPrice
			? ` from ${formatPrice(+params.minPrice)} to ${formatPrice(
					+params.maxPrice
			  )}`
			: params.maxPrice
			? ` under ${formatPrice(+params.maxPrice)}`
			: params.minPrice
			? ` above ${formatPrice(+params.minPrice)}`
			: "";

	const featuresSegment =
		params.features && params.features.length > 1
			? ` featuring ${params.features.join(", ")}`
			: "";
	const featureSegment =
		params.features && params.features.length === 1
			? `${capitalizeWords(params.features[0]).replace(
					"Gulfaccess",
					"Gulf Access"
			  )} `
			: "";

	const typeSegment =
		params.propertyTypes && params.propertyTypes.length > 0
			? `${params.propertyTypes.join(", ")} for sale`
			: "Real Estate & Homes for sale";

	// --- Title ---
	let title = `${featureSegment}${typeSegment} in ${
		community ? community + " " : ""
	}${cityPart}${priceSegment}`;
	if (title.length > 70)
		title = `${featureSegment}${typeSegment} - ${
			community ? community + " " : ""
		}${cityPart}`.replace("for sale", "");

	// --- Description ---
	let description = `We have total ${total} ${featureSegment}${typeSegment} ${
		community ? community + ", " : ""
	}${cityPart}${bedBath}${featuresSegment}. Search ${featureSegment}${typeSegment}${priceSegment} in ${
		community ? community + ", " : ""
	}${cityPart}`;

	// --- H1 Heading ---
	const heading = `${featureSegment}${
		community || city ? "" : "Florida"
	} ${typeSegment} ${
		community || city
			? "in " + `${community && community + " "}` + city + ", FL"
			: ""
	}`.trim();

	// --- Keywords ---
	const keywords = [
		city,
		community,
		...params.propertyTypes,
		params.beds && `${params.beds}-bedroom homes`,
		params.baths && `${params.baths}-bath homes`,
		...params.features,
		"Florida real estate",
		"homes for sale",
		"condos for sale",
		"lots for sale",
		"Gulfshore Group",
	]
		.filter(Boolean)
		.join(", ");

	// --- Related Listings (for JSON-LD) ---
	const relatedListings = similar.map((prop, i) => ({
		"@type": "ListItem",
		url: `https://gulfshoregroup.com${UrlMaker(
			prop.City,
			prop.DevelopmentName,
			prop.PropertyAddress
		)}`,
		position: i + 1,
		item: {
			"@type": "RealEstateListing",
			name: `${prop.FullAddress || prop.PropertyAddress}, ${
				prop.City
			}`,

			address: {
				"@type": "PostalAddress",
				streetAddress: prop.FullAddress || prop.PropertyAddress,
				addressLocality: prop.City,
				addressRegion: "FL",
				addressCountry: "US",
			},
			offers: {
				"@type": "Offer",
				price: prop.CurrentPrice
					? formatPrice(prop.CurrentPrice)
					: undefined,
				priceCurrency: "USD",
				availability: "http://schema.org/InStock",
				itemOffered: {
					"@type": "RealEstateListing",
					streetAddress: prop.FullAddress || prop.PropertyAddress,
					addressLocality: prop.City,
					addressRegion: "FL",
					addressCountry: "US",
					geo: {
						"@type": "GeoCoordinates",
						latitude: prop.Latitude,
						longitude: prop.Longitude,
					},
				},
			},
		},
	}));

	// --- JSON-LD Structured Data ---
	const jsonld = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: title,
		description,
		itemListElement: relatedListings,
		provider: {
			"@type": "Organization",
			name: "Gulfshore Group",
			url: "https://gulfshoregroup.com",
			logo: "https://gulfshoregroup.com/logo.png",
			telephone: "+1-239-992-9119",
			email: "mailbox@gulfshoregroup.com",
			address: {
				"@type": "PostalAddress",
				addressLocality: "Naples",
				addressRegion: "FL",
				postalCode: "34102",
				addressCountry: "US",
			},
		},
	};

	return {
		title,
		description,
		heading,
		keywords,
		jsonld,
		total,
		content: {
			Images: content?.Images || [],
			infoText:
				content?.infoText ||
				`Discover ${cityPart}${
					community ? ` – ${community}` : ""
				} real estate listings. Explore beautiful ${typeSegment}${bedBath}${featuresSegment} with Gulfshore Group.`,
		},
		city,
		community,
		similar,
	};
}
