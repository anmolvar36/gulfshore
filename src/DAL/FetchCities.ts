"use server";

import City from "@/models/city";
import connectDB from "@/lib/dbconfig";
export default async function FetchCities() {
	try {
		await connectDB();

		const res = await City.find({ featured: true })
			.sort({ index: -1 })
			.lean();
		const cities = res.map((c) => ({
			...c,
			_id: String(c._id),
		}));

		return cities;
	} catch (error) {
		console.error("Error fetching cities:", error);
		return [];
	}
}
