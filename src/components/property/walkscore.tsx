"use client";

import { useEffect, useState } from "react";
import fetchWalkScore from "./fetchwalkscore";
import { Bike, Footprints, Train } from "lucide-react";

interface WalkScoreData {
	walkscore?: number;
	description?: string;
	bike?: {
		score?: number;
		description?: string;
	};
	transit?: {
		score?: number;
		description?: string;
	};
}

export default function WalkScore({
	latitude,
	longitude,
	address,
}: {
	latitude: number;
	longitude: number;
	address: string;
}) {
	const [walkScoreData, setWalkScoreData] =
		useState<WalkScoreData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (latitude && longitude && address) {
			const getData = async () => {
				const data = await fetchWalkScore({
					latitude: latitude,
					longitude: longitude,
					address: address,
				});
				setWalkScoreData(data);
				setLoading(false);
			};
			getData();
		}
	}, [latitude, longitude, address]);

	if (loading) return <p>.</p>;

	if (!walkScoreData) return <p></p>;

	return (
		<div className="lg:px-4 lg:mt-0 mt-5">
			<h4 className="text-lg lg:text-xl font-medium text-gray-900 mb-4">
				Walk Scores
			</h4>
			<div className="_prtis_list_body">
				<div className="flex lg:flex-nowrap flex-wrap gap-4">
					{/* Walk Score */}
					{walkScoreData.walkscore !== undefined && (
						<div className="flex gap-3 rounded-md bg-slate-50 shadow w-full p-2">
							<div className="p-4 h-16 w-16 inline-flex items-center rounded-full bg-green-300 text-white text-center">
								<Footprints size={40} />
							</div>
							<div className="flex flex-col">
								<span className="text-base">
									<span className="text-green-700 text-lg font-semibold">
										{walkScoreData.walkscore}
									</span>
									/100
								</span>

								<span>Walk Score</span>
								<span className="text-gray-600 font-thin text-sm">
									{walkScoreData.description}
								</span>
							</div>
						</div>
					)}

					{/* Bike Score */}
					{walkScoreData.bike?.score !== undefined && (
						<div className="flex gap-3 rounded-md bg-slate-50 shadow w-full p-2">
							<div className="p-4 h-16 w-16 inline-flex items-center rounded-full bg-green-300 text-white text-center">
								<Bike size={40} />
							</div>
							<div className="flex flex-col">
								<span className="text-base">
									<span className="text-green-700 text-lg font-semibold">
										{walkScoreData.bike.score}
									</span>
									/100
								</span>

								<span>Bike Score</span>
								<span className="text-gray-600 font-thin text-sm">
									{walkScoreData.bike.description}
								</span>
							</div>
						</div>
					)}

					{/* Transit Score (Only if available) */}
					{walkScoreData.transit?.score !== undefined && (
						<div className="flex gap-3 rounded-md bg-slate-50 shadow w-full p-2">
							<div className="p-4 h-16 w-16 inline-flex items-center rounded-full bg-gray-400 text-white text-center">
								<Train size={40} />
							</div>
							<div className="flex flex-col">
								<span className="text-base">
									<span className="text-green-700 text-lg font-semibold">
										{walkScoreData.transit.score}
									</span>
									/100
								</span>

								<span>Walk Score</span>
								<span className="text-gray-600 font-thin text-sm">
									{walkScoreData.transit.description}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
