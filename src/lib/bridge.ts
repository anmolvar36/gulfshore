// lib/bridge.ts
const BASE_URL =
	process.env.BRIDGE_BASE_URL ||
	"https://api.bridgedataoutput.com/api/v2";
const API_KEY = process.env.BRIDGE_API_KEY || "";
const SOURCE = process.env.BRIDGE_SOURCE || "nabor";

export async function fetchBridgeBatch(
	offset: number,
	limit: number,
	date: string,
	status: string
) {
	const filter = `StandardStatus.eq=${status}&BridgeModificationTimestamp.gte=${date}`;

	const url =
		`${BASE_URL}/${SOURCE}/listings` +
		`?access_token=${API_KEY}` +
		`&limit=${limit}` +
		`&offset=${offset}` +
		`&${filter}`;

	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(`Bridge API error: ${res.status}, ${url}`);
	}

	return res.json();
}
