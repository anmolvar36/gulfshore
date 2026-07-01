import capitalizeWords from "@/hooks/capitalize-letter";

async function fetchCommunities(city: string) {
	try {
		const res = await fetch(
			`https://gulfshoregroup.com/api/v2/cities/${capitalizeWords(
				city.replaceAll("-", " ")
			)}/communities/`
		);
		const data = await res.json();

		return data;
	} catch (error) {
		//  console.error(error);
		return [];
	}
}

export default fetchCommunities;
