import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redisGet, redisSet } from "@/lib/safeRedis";

const MAX_LIMIT = 100;

function parseNumber(value?: string | null) {
	if (!value) return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: NextRequest) {
	try {
		const query = req.nextUrl.searchParams;
		const { userId } = await auth();

		const shouldCache = !userId;
		const cacheKey = "search:" + query.toString();

		if (shouldCache) {
			const cached = await redisGet(cacheKey);
			if (cached) return NextResponse.json(JSON.parse(cached));
		}

		// ---- Pagination ----
		const page = Math.max(1, Number(query.get("page") || 1));
		const limit = Math.min(
			MAX_LIMIT,
			Math.max(1, Number(query.get("limit") || 10))
		);
		const skip = (page - 1) * limit;

		// ---- Sorting ----
		const sortField = query.get("sort") || "ListPrice";
		const sortOrder = query.get("order") === "asc" ? "asc" : "desc";

		// ---- WHERE CLAUSE ----
		const where: any = {
			StandardStatus: query.get("Status") || "Active",
		};

		// ---- Price ----
		const minPrice = parseNumber(query.get("minPrice"));
		const maxPrice = parseNumber(query.get("maxPrice"));
		if (minPrice || maxPrice) {
			where.ListPrice = {
				...(minPrice && { gte: minPrice }),
				...(maxPrice && { lte: maxPrice }),
				...(!minPrice && {
					not: null,
					gte: 0,
				}),
			};
		}
		if (!minPrice) {
			where.ListPrice = {
				not: null,
				gte: 1000,
			};
		}

		where.PropertyType = {
			not: "Residential Lease",
		};

		// ---- Location ----
		if (query.get("city")) {
			where.City = {
				contains: query.get("city")!,
				mode: "insensitive",
			};
		}

		if (query.get("developmentName")) {
			where.Community = {
				contains: query.get("developmentName")!,
				mode: "insensitive",
			};
		}

		if (query.get("postalCode")) {
			where.PostalCode = query.get("postalCode")!;
		}

		if (query.get("MLSNumber")) {
			where.MLSNumber = query.get("MLSNumber")!;
		}

		// ---- Beds & Baths ----
		const beds = parseNumber(query.get("beds"));
		if (beds) where.BedroomsTotal = { gte: beds };

		const baths = parseNumber(query.get("baths"));
		if (baths) where.BathroomsFull = { gte: baths };

		// ---- Year Built ----
		const builtMin = parseNumber(query.get("builtYearMin"));
		const builtMax = parseNumber(query.get("builtYearMax"));
		if (builtMin || builtMax) {
			where.YearBuilt = {
				...(builtMin && { gte: builtMin }),
				...(builtMax && { lte: builtMax }),
			};
		}

		if (query.get("NoHOA")) where.HOAMandatoryYN = false;
		// ---- Features ----
		const features = query.getAll("features[]");

		if (features.includes("waterfront")) where.WaterfrontYN = true;
		if (features.includes("pool")) where.PoolPrivateYN = true;

		// ---- Property Types ----
		const propTypes = query.getAll("propertyTypes[]");

		if (propTypes.length) {
			where.OR = [];

			// Homes → Single Family + Townhouse
			if (propTypes.includes("Homes")) {
				where.OR.push({
					PropertySubType: "Single Family Residence",
				});
			}

			// Condos → Low / Mid / High Rise / Townhouse
			if (propTypes.includes("Condos")) {
				where.OR.push({
					PropertySubType: {
						in: [
							"Low Rise (1-3)",
							"Mid Rise (4-7)",
							"High Rise (8+)",
							"Townhouse",
						],
					},
				});
			}

			// Residential Lots
			if (propTypes.includes("Residential-Lots")) {
				where.OR.push({
					AND: [
						{
							PropertyType: "Land",
						},
					],
				});
			}
		}

		// ---- Geo Bounding Box ----
		const north = parseNumber(query.get("north"));
		const south = parseNumber(query.get("south"));
		const east = parseNumber(query.get("east"));
		const west = parseNumber(query.get("west"));

		if (north && south && east && west) {
			where.AND = [
				{ Latitude: { gte: south, lte: north } },
				{ Longitude: { gte: west, lte: east } },
			];
		}

		// ---- Queries ----
		const [total, properties] = await Promise.all([
			prisma.property.count({ where }),
			prisma.property.findMany({
				where,
				skip,
				take: limit,
				select: {
					id: true,
				  
					// ---- Bridge Identity ----
					ListingKey: true,
					ListingId: true,
					MLSNumber: true,
					SourceSystemKey: true,
					Development: true,
					Community: true,
				  
					// ---- Status & Dates ----
					StandardStatus: true,
					MlsStatus: true,
					StatusType: true,
					OnMarketDate: true,
					OnMarketTimestamp: true,
					StatusChangeTimestamp: true,
					ModificationTimestamp: true,
					BridgeModificationTimestamp: true,
					MajorChangeType: true,
					MajorChangeTimestamp: true,
				  
					// ---- Pricing ----
					ListPrice: true,
					ClosePrice: true,
					OriginalListPrice: true,
					PriceChangeTimestamp: true,
				  
					City: true,
					StateOrProvince: true,
					PostalCode: true,
					CountyOrParish: true,
					FullAddress: true,
				  
					// ---- Property Info ----
					Description: true,
					PropertyType: true,
					PropertySubType: true,
					BedroomsTotal: true,
					BathroomsFull: true,
					BathroomsHalf: true,
					BathroomsTotalInteger: true,
					BathroomsTotalDecimal: true,
					LivingArea: true,
					LivingAreaUnits: true,
					BuildingAreaTotal: true,
					BuildingAreaUnits: true,
					YearBuilt: true,
					StoriesTotal: true,
					RoomsTotal: true,
				  
					// ---- Lot Info ----
					LotSizeAcres: true,
					LotSizeSquareFeet: true,
					LotSizeArea: true,
					LotSizeUnits: true,
				  
					// ---- Location Details ----
					SubdivisionName: true,
					MLSAreaMajor: true,
					MLSAreaMinor: true,
					Directions: true,
				  
					// ---- Geo ----
					Latitude: true,
					Longitude: true,
					MapCoordinate: true,
				  
					HeatingYN: true,
					CoolingYN: true,
				  
					// ---- Parking & Garage ----
					GarageYN: true,
					GarageSpaces: true,
					AttachedGarageYN: true,
					CarportYN: true,
					CarportSpaces: true,
					CoveredSpaces: true,
					ParkingTotal: true,
				  
					// ---- Water & Outdoor ----
					WaterfrontYN: true,
					ViewYN: true,
					View: true,
					GulfAccessYN: true,
					PoolPrivateYN: true,
					SpaYN: true,
				  
					// ---- Community & Association ----
					AssociationYN: true,
					AssociationFee: true,
					AssociationFeeFrequency: true,
					AssociationAmenities: true,
					CommunityFeatures: true,
					DaysOnMarket: true,
				  
					// ---- Property Condition ----
					NewConstructionYN: true,
					Furnished: true,
					PossessionType: true,
					Zoning: true,
					ZoningDescription: true,
					LandLeaseYN: true,
				  
					// ---- Financial ----
					TaxYear: true,
					MasterHOAFee: true,
					HOAFee: true,
					HOAFeeFreq: true,
					MasterHOAFeeFreq: true,
					MandatoryHOAYN: true,
				  
					// ---- Agent & Office Info ----
					ListAgentFullName: true,
					ListAgentKey: true,
					ListAgentMlsId: true,
					ListAgentEmail: true,
					ListAgentDirectPhone: true,
					ListAgentCellPhone: true,
					ListAgentOfficePhone: true,
					ListAgentOfficePhoneExt: true,
				  
					ListOfficeName: true,
					ListOfficeKey: true,
					ListOfficeMlsId: true,
					ListOfficeEmail: true,
					ListOfficePhone: true,
					ListOfficePhoneExt: true,
				  
					// ---- Media & Virtual Tours ----
					PhotosCount: true,
					PhotosChangeTimestamp: true,
					VideosCount: true,
					VideosChangeTimestamp: true,
					VirtualTourURLUnbranded: true,
					VirtualTourURLBranded: true,
					AllPixDownloaded: true,
					images: true,
					communityId: true,
				  },
				orderBy: { [sortField]: sortOrder },
			}),
		]);

		// ---- Wishlist ----
		// let wishlistMap = new Set<string>();

		// if (userId) {
		// 	const wishlisted = await prisma.wishlist.findMany({
		// 		where: {
		// 			user: { clerkId: userId },
		// 			propertyId: {
		// 				in: properties.map((p: { id: any }) => p.id),
		// 			},
		// 		},
		// 		select: { propertyId: true },
		// 	});

		// 	wishlistMap = new Set(
		// 		wishlisted.map((w: { propertyId: any }) => w.propertyId)
		// 	);
		// }

		const data = properties.map((p: { id: string }) => ({
			...p,
			isWishlisted: false,
		}));

		const response = {
			success: true,
			total,
			page,
			totalPages: Math.ceil(total / limit),
			data,
		};

		if (shouldCache) {
			await redisSet(cacheKey, JSON.stringify(response), 7200);
		}

		return NextResponse.json(response);
	} catch (error: any) {
		console.error("Search error:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
