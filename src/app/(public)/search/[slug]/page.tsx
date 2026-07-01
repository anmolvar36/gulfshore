import capitalizeWords from "@/hooks/capitalize-letter";
import UrlMaker from "@/hooks/url-maker";
import axios from "axios";
import { redirect } from "next/navigation";

export async function fetchProperty(address: string) {
	const url = `https://gulfshoregroup.com/api/v2/properties/${address}`;
	try {
		const property = await axios.get(url);
		return property.data.data;
	} catch (error) {
		console.error("Error fetching property:", error);
		return null;
	}
}

export default async function SearchListingPage({
	params,
}: {
	params: { slug: string };
}) {
	const id = (await params).slug;
	const property = await fetchProperty(id!);

	redirect(
		UrlMaker(
			property.City,
			property.Community,
			property.FullAddress,
			property.MLSNumber
		)
	);
}
