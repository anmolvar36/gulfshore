"use server";
import React, { Suspense } from "react";
import AreaInfoComponent from "../../areaInfoComponent";
import PropertySection from "@/components/property/propertysection/propertySlider";
import capitalizeWords from "@/hooks/capitalize-letter";

import type { Metadata } from "next";

export async function generateMetadata({
	params,
}: {
	params: { city: string; community: string };
}): Promise<Metadata> {
	const city = decodeURIComponent((await params).city || "");
	const community = decodeURIComponent(
		(await params).community || ""
	);

	// Capitalize for cleaner titles
	const formattedCity = city.replace(/\b\w/g, (c) => c.toUpperCase());
	const formattedCommunity = community.replace(/\b\w/g, (c) =>
		c.toUpperCase()
	);

	const title = `${formattedCommunity} Homes for Sale in ${formattedCity}, FL | Gulfshore Group Real Estate`;
	const description = `Explore luxury homes, condos, and properties for sale in ${formattedCommunity}, ${formattedCity}, Florida. View photos, property details, and updated MLS listings with Gulfshore Group — your trusted local real estate experts.`;
	const keywords = `
	${formattedCommunity} homes for sale,
	${formattedCommunity} real estate listings,
	${formattedCommunity} condos for sale,
	${formattedCity} homes for sale,
	${formattedCity} real estate,
	${formattedCity} condos for sale,
	luxury homes in ${formattedCity},
	Florida real estate,
	Southwest Florida homes,
	${formattedCommunity} waterfront homes,
	${formattedCommunity} golf community,
	Gulfshore Group ${formattedCity}
	`;

	return {
		title,
		description,
		keywords,
		alternates: {
			canonical: `https://gulfshoregroup.com/explore/${city}/${community}`,
		},
		openGraph: {
			title,
			description,
			url: `https://gulfshoregroup.com/explore/${city}/${community}`,
			siteName: "Gulfshore Group",
			images: [
				{
					url: "https://gulfshoregroup.com/logo.png",
					alt: `${formattedCommunity} Homes for Sale in ${formattedCity}`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ["https://gulfshoregroup.com/logo.png"],
		},
	};
}

async function ExploreCommunity({
	params,
}: {
	params: {
		city: string;
		community: string;
	};
}) {
	const city = decodeURIComponent((await params).city).replaceAll(
		"-",
		" "
	);
	const community = decodeURIComponent(
		(await params).community
	).replaceAll("-", " ");
	const formattedCity = city.replace(/\b\w/g, (c) => c.toUpperCase());
	const formattedCommunity = community.replace(/\b\w/g, (c) =>
		c.toUpperCase()
	);
	return (
		<div>
			<AreaInfoComponent
				city={formattedCity}
				community={formattedCommunity}
			/>
			<Suspense>
				<div className="flex flex-col gap-10">
					<PropertySection
						props={
							<div className="items-start mt-4 justify-start flex flex-col">
								<h2 className="lg:text-2xl text-xl text-start font-medium lg:font-medium">
									Latest Listings in{" "}
									{capitalizeWords(formattedCommunity)}{" "}
									{capitalizeWords(formattedCity)}, Florida
									<span className="text-primary font-bold"></span>
								</h2>
								<p className="py-2 text-start text-xs md:text-sm lg:font-medium font-semibold lg:text-base text-gray-700">
									Explore Latest Listings in{" "}
									<span className="text-primary font-semibold">
										{capitalizeWords(formattedCommunity)}{" "}
										{capitalizeWords(formattedCity)}, Florida
									</span>
									.
								</p>
							</div>
						}
						queryParams={{
							city,
							developmentName: community,
							order: "asc",
							sort: "CreatedDate",
						}}
					/>
					<PropertySection
						props={
							<div className="items-start mt-4 justify-start flex flex-col">
								<h2 className="lg:text-2xl text-xl text-start font-medium lg:font-medium">
									Homes For Sale in{" "}
									<span className="text-primary font-bold">
										{capitalizeWords(formattedCommunity)}{" "}
										{capitalizeWords(formattedCity)}, Florida
									</span>
								</h2>
								<p className="py-2 text-start text-xs md:text-sm lg:font-medium font-semibold lg:text-base text-gray-700">
									Explore Homes for sale in{" "}
									<span className="text-primary font-semibold">
										{capitalizeWords(formattedCommunity)}{" "}
										{capitalizeWords(formattedCity)}, Florida
									</span>
									.
								</p>
							</div>
						}
						queryParams={{
							city,
							developmentName: community,
							propertyTypes: ["Homes"],
						}}
					/>
					<PropertySection
						props={
							<div className="items-start mt-4 justify-start flex flex-col">
								<h2 className="lg:text-2xl text-xl text-start font-medium lg:font-medium">
									Waterfront Homes & Real Estate For Sale in{" "}
									<span className="text-primary font-bold">
										{capitalizeWords(formattedCommunity)}{" "}
										{capitalizeWords(formattedCity)}, Florida
									</span>
								</h2>
								<p className="py-2 text-start text-xs md:text-sm lg:font-medium font-semibold lg:text-base text-gray-700">
									Explore Waterfront Homes & Real Estate for sale in{" "}
									<span className="text-primary font-semibold">
										{capitalizeWords(formattedCommunity)}{" "}
										{capitalizeWords(formattedCity)}, Florida
									</span>
									.
								</p>
							</div>
						}
						queryParams={{
							city,
							developmentName: community,
							features: ["waterfront"],
						}}
					/>{" "}
					<PropertySection
						props={
							<div className="items-start mt-4 justify-start flex flex-col">
								<h2 className="lg:text-2xl text-xl text-start font-medium lg:font-medium">
									Homes & Real Estate For Sale in{" "}
									<span className="text-primary font-bold">
										{capitalizeWords(formattedCommunity)}{" "}
										{capitalizeWords(formattedCity)}, Florida{" "}
									</span>
									Under 1M
								</h2>
								<p className="py-2 text-start text-xs md:text-sm lg:font-medium font-semibold lg:text-base text-gray-700">
									Explore Waterfront Homes & Real Estate for sale in{" "}
									<span className="text-primary font-semibold">
										{capitalizeWords(formattedCommunity)}{" "}
										{capitalizeWords(formattedCity)}, Florida{" "}
									</span>
									Under 1M.
								</p>
							</div>
						}
						queryParams={{
							city,
							developmentName: community,
							maxPrice: "1000000",
						}}
					/>{" "}
				</div>
			</Suspense>
		</div>
	);
}

export default ExploreCommunity;
