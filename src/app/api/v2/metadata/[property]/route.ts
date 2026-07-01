import connectDB from "@/lib/dbconfig";
import Property from "@/models/property";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ property: string }> }
) {
	try {
		const { property } = await params;
		const propertyAddress = property.trim().replaceAll(/\s+/g, "-");
		await connectDB();
		const res = await Property.aggregate([
			{
				$match: {
					PropertySearchSlug: propertyAddress,
				},
			},
			{
				$project: {
					PropertyAddress: 1,
					FullAddress: 1,
					LotType: 1,
					CurrentPrice: 1,
					MasterHOAFeeFreq: 1,
					MasterHOAFee: 1,
					Latitude: 1,
					Longitude: 1,
					CreatedDate: 1,
					AllPixList: 1,
					DefaultPic: 1,
					PropertyClass: 1,
					Acres: 1,
					ApproxLivingArea: 1,
					BathsTotal: 1,
					BedsTotal: 1,
					Status: 1,
					PropertyType: 1,
					YearBuilt: 1,
					City: 1,
					PostalCode: 1,
					MLSNumber: 1,
					Development: 1,
					DevelopmentName: 1,
					score: 1,
					ListOfficeName: 1,
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
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
