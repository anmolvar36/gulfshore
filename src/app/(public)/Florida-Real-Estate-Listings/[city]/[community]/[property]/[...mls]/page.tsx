"use server";
import OwnerCard from "@/components/cards/property/ownerCard";
import SliderComponent from "@/components/global/slider";
import ListingLabels from "@/components/property/listingLabels";
import ReadMore from "@/components/property/readmore";
import SocialShare from "@/components/property/share-card";
import { WishListButton } from "@/components/property/wishlistButton";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import capitalizeWords from "@/hooks/capitalize-letter";

import UrlMaker from "@/hooks/url-maker";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";

import {
	Bed,
	BathIcon,
	Expand,
	Calendar,
	Search,
} from "lucide-react";
import React, { Suspense } from "react";
import PropertyDetail from "./pageComponent";
import Link from "next/link";
import MortgageCalculator from "@/components/property/mortgage-card";
import fetchMetadataFromSlug from "@/DAL/FetchMetaData";
import Image from "next/image";
import { FetchProperty } from "@/DAL/FetchProperties";
import Footer from "@/components/global/footer";
import PropertyDetailsTable from "./infoTable";
import createRealEstateJsonLd from "@/hooks/getJsonSchema";
import SimilarLinksSection from "@/components/search/links-section/similarLinksSection";
import CityLinksSection from "@/components/search/links-section/cityLinksSection";
import { Property } from "@/app/generated/prisma/client";

export default async function Listing({
	params,
}: {
	params: { mls: string[] };
}) {
	const id = (await params).mls?.[0];
	const property: Property = await FetchProperty(id);
	const media = (property.images ?? (property as any)?.raw?.Media) as any;
	let images: string[] = [];
	if (media && media.length > 0) {
		images = media
			.filter((item: any) => item.MediaCategory === "Photo")
			.map((item: any) => item.MediaURL);
	}

	const isValidField = (value: any) => {
		return (
			value !== null &&
			value !== undefined &&
			value !== "" &&
			value !== "No" &&
			value !== "0" &&
			value !== "none" &&
			value !== "N/A" &&
			value !== "None" &&
			value !== "0.00" &&
			value !== "0%" &&
			value !== "No Information"
		);
	};

	// Handle case when property is not found
	if (!property) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">
						Property Not Found
					</h1>
					<p className="text-gray-600 mb-4">
						The requested property could not be found.
					</p>
					<Link href="/" className="text-blue-600 hover:underline">
						Return to Home
					</Link>
				</div>
			</div>
		);
	}

	const city = capitalizeWords(property.City || "");
	const development = capitalizeWords(
		property.Community || (property.raw as any).MLSAreaMajor || ""
	);

	const Meta = await fetchMetadataFromSlug([
		property.City || "",
		development,
	]);
	const jsonLd = createRealEstateJsonLd(property);
	return (
		<>
			<div className="mt-5 w-11/12 mx-auto">
				{/* Enhanced Breadcrumb with structured data */}
				<Breadcrumb className="my-4">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">Home</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink
								href={`/Florida-Real-Estate-Search/${city}`.replaceAll(
									" ",
									"-"
								)}>
								{city}
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink
								href={`/Florida-Real-Estate-Search/${city}/${development}`
									.replaceAll(" ", "-")
									.replaceAll("&", "And")}>
								{development}
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>
								{capitalizeWords(property.FullAddress).replace(
									" Fl",
									" FL"
								)}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<SliderComponent
					address={property.FullAddress || ""}
					images={images || []}
				/>

				<div className="w-full grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(500px,1fr))] justify-between border-t-2 border-gray-200 xl:gap-5 items-center mt-4">
					<Card className="my-4 w-full h-full shadow-none border-l-2 border-gray-200 rounded-xl bg-white overflow-hidden">
						<CardContent className="p-6">
							{/* Header with labels and actions */}
							<div className="flex justify-between items-start mb-4">
								<ListingLabels
									CreatedDate={property.OnMarketDate || ""}
									Status={property.StandardStatus || ""}
									StatusType={property.StatusType || ""}
								/>
								<div className="flex gap-3 items-center">
									<div className="p-2 hover:bg-gray-100 rounded-full transition-colors">
										<WishListButton propertyId={property.id} />
									</div>
									<div className="p-2 hover:bg-gray-100 rounded-full transition-colors">
										<SocialShare
											propertyUrl={UrlMaker(
												property.City,
												property.Development || "",
												property.FullAddress,
												property.MLSNumber
											)}
										/>
									</div>
								</div>
							</div>

							{/* Price with enhanced styling */}
							<div className="mb-3">
								<span className="text-3xl inline-flex gap-2 lg:text-4xl font-bold text-gray-900 tracking-tight">
									$
									{Number(property.ListPrice).toLocaleString("en-US")}{" "}
									{property.PropertyType === "Residential Lease" && (
										<span className="text-gray-800 my-auto h-full text-sm font-medium">
											- For Lease
										</span>
									)}
								</span>
							</div>

							{/* Property address with better typography */}
							<h1 className="text-lg lg:text-xl font-medium text-gray-700 mb-4 leading-relaxed">
								{capitalizeWords(property.FullAddress).replace(
									" Fl",
									" FL"
								)}
							</h1>

							{/* Enhanced property features with improved layout */}
							<div className="w-full">
								{property.PropertyType !== "Lot and Land" ? (
									<div className="flex flex-wrap gap-4">
										<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
											<div className="p-2 rounded-full bg-blue-100 text-blue-600">
												<Bed className="w-5 h-5" />
											</div>
											<div>
												<div className="text-lg font-semibold text-gray-900">
													{Number(property.BedroomsTotal)}
												</div>
												<div className="text-sm text-gray-500">
													Beds
												</div>
											</div>
										</div>

										<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
											<div className="p-2 rounded-full bg-green-100 text-green-600">
												<BathIcon className="w-5 h-5" />
											</div>
											<div>
												<div className="text-lg font-semibold text-gray-900">
													{Number(property.BathroomsFull)}
												</div>
												<div className="text-sm text-gray-500">
													Baths
												</div>
											</div>
										</div>

										<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
											<div className="p-2 rounded-full bg-purple-100 text-purple-600">
												<Expand className="w-5 h-5" />
											</div>
											<div>
												<div className="text-lg font-semibold text-gray-900">
													{property.LivingArea?.toLocaleString()}
												</div>
												<div className="text-sm text-gray-500">
													Sqft
												</div>
											</div>
										</div>

										<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
											<div className="p-2 rounded-full bg-orange-100 text-orange-600">
												<Calendar className="w-5 h-5" />
											</div>
											<div>
												<div className="text-lg font-semibold text-gray-900">
													{property.YearBuilt}
												</div>
												<div className="text-sm text-gray-500">
													Built
												</div>
											</div>
										</div>
									</div>
								) : (
									<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg max-w-xs">
										<div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
											<Expand className="w-5 h-5" />
										</div>
										<div></div>
									</div>
								)}
							</div>
						</CardContent>

						<CardFooter className="bg-gray-50 border-t border-gray-200 px-6 py-4">
							<div className="text-xs text-gray-600 leading-relaxed">
								<span className="font-medium">Source:</span>{" "}
								NAPLESMLS#
								{property.MLSNumber}
								<br />
								<span className="font-medium">
									Listing Office:
								</span>{" "}
								{(property.raw as any).ListOfficeName}
								<br />
								<span className="font-medium">
									Showing Office:
								</span>{" "}
								GULFSHORE GROUP
							</div>
						</CardFooter>
					</Card>
				</div>

				<div className="mx-auto w-full">
					<OwnerCard
						property={{
							propertyAddress: property.FullAddress,
							MLSNumber: property.MLSNumber,
						}}
					/>
				</div>
			</div>

			<div className="w-11/12 my-12 mx-auto">
				<PropertyDetailsTable property={property} />
				<Suspense>
					<MortgageCalculator
						propertyPrice={Number(property.ListPrice)}
					/>
				</Suspense>
			</div>

			<Suspense>
				<PropertyDetail {...property} />
			</Suspense>
			{/* <PropertySection
				props={
					<h2 className="py-4 px-2 font-semibold mt-10 lg:mt-12 text-lg lg:text-xl">
						Similar Properties in{" "}
						<span className="text-primary">
							{capitalizeWords(
								property.Community ||
									(property.raw as any).MLSAreaMajor ||
									""
							)}
							, {capitalizeWords(property.City)} Florida
						</span>
					</h2>
				}
				queryParams={{
					city: property.City,
					...(isValidField(property.OwnershipDesc)
						? {
								propertyType:
									property.OwnershipDesc === "Single Family"
										? "Homes"
										: "Condos",
						  }
						: { propertyType: "Residential-Lots" }),

					development: property.Development,
					developmentName: property.DevelopmentName,
					sort: "CurrentPrice",
					limit: "5",
					order: "desc",
				}}
			/>

			<PropertySection
				props={
					<h2 className="py-4 px-2 font-semibold mt-10 lg:mt-12 text-lg lg:text-xl">
						Explore Properties in{" "}
						<span className="text-primary">
							{capitalizeWords(property.City)}, Florida
						</span>
					</h2>
				}
				queryParams={{
					sort: "CurrentPrice",
					order: "desc",
					limit: "5",
					city: property.City,
					...(isValidField(property.OwnershipDesc)
						? {
								propertyType:
									property.OwnershipDesc === "Single Family"
										? "Homes"
										: "Condos",
						  }
						: { propertyType: "Residential-Lots" }),
				}}
			/> */}
			<section className="mt-14 md:mt-16 lg:mt-20">
				<div className="mx-auto w-11/12">
					<div className="rounded-2xl overflow-hidden ">
						<div className="flex flex-col items-center lg:flex-row">
							{/* Image Section */}
							<div className="lg:w-2/5  relative">
								<div className="relative rounded-xl overflow-hidden  lg:h-full">
									<Image
										className="w-full h-full rounded-2xl overflow-hidden object-cover"
										width={450}
										height={400}
										alt={`${Meta.city} city view`}
										src={Meta.content.Images?.[0] || "/map-bg.webp"}
									/>
									<div className="absolute h-full bottom-0 left-0 right-0 text-center bg-linear-to-t from-gray-800/60 via-black/70 to-gray-800/50 p-4">
										<div className="flex flex-col items-center justify-center h-full">
											<span className="text-xl lg:text-3xl font-bold text-white leading-tight">
												{Meta.community}, {Meta.city}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Content Section */}
							<div className=" lg:w-3/5 p-6 sm:p-8 lg:p-10">
								<div className="flex flex-col h-full justify-center">
									<div className="space-y-4">
										<div className="flex items-center space-x-2">
											<div className="w-1 h-8 bg-accent rounded-full"></div>
											<h2 className="text-2xl lg:text-4xl font-bold text-primary leading-tight">
												{Meta.community}, {Meta.city}
											</h2>
										</div>

										<div className="prose prose-gray max-w-none lg:max-h-[480px] overflow-y-auto">
											<ReadMore
												link={`/Florida-Real-Estate-Search/${capitalizeWords(
													property.City
												).replaceAll(" ", "-")}/${capitalizeWords(
													property.Development ||
														(property.raw as any).MLSAreaMajor ||
														""
												).replaceAll(" ", "-")}`}
												className="text-gray-500 leading-relaxed ">
												{Meta.content.infoText
													?.replaceAll("*", "")
													.replaceAll("###", "•")
													.replaceAll("##", "•")
													.replaceAll("#", "") || ""}
											</ReadMore>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<div className="my-5 mx-auto w-11/12">
				<span className="font-semibold text-sm">Disclaimer:</span>
				<span className="text-xs font-light text-gray-600">
					The source of this real property information is the
					copyrighted and proprietary database compilation of the
					M.L.S. of Naples, Inc. Copyright M.L.S. of Naples, Inc. All
					rights reserved. The accuracy of this information is not
					warranted or guaranteed. This information should be
					independently verified if any person intends to engage in a
					transaction in reliance upon it.
				</span>
			</div>
			{/* {property.similar && (
				<section className="my-4 w-11/12 mx-auto">
					<h2 className="lg:text-lg font-medium px-4 pt-3 text-gray-900 lg:font-semibold mb-2">
						Explore More Properties in {development}:
					</h2>
					<div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
						{property.similar.map(
							(
								similar: {
									City: string;
									slug: string;
									DevelopmentName: string;
									FullAddress: string;
									PropertyAddress: string;
									CurrentPrice: string;
								},
								i: number
							) => (
								<a
									key={i}
									href={UrlMaker(
										similar.City,
										similar.DevelopmentName,
										similar.PropertyAddress
									)}
									className="inline-flex gap-1 items-center px-2 lg:py-3 py-2 text-sm text-start font-medium  hover:underline">
									<Search size={20} />{" "}
									<span className=" lg:font-medium text-blue-600 md:font-normal">
										{capitalizeWords(similar.FullAddress)} -{" "}
										{formatPrice(Number(similar.CurrentPrice))}
									</span>
								</a>
							)
						)}
					</div>
				</section>
			)} */}

			<SimilarLinksSection property={property} />
			<CityLinksSection city={property.City} />
			<Footer />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
		</>
	);
}
