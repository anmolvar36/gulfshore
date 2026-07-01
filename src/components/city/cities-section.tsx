"use client";
import { Card } from "../ui/card";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import capitalizeWords from "@/hooks/capitalize-letter";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "../ui/carousel";
import axios from "axios";
import Cities from "@/types/cities";

export default function CitiesSection() {
	const [cities, setCities] = useState<any[]>([]);
	const router = useRouter();
	useEffect(() => {
		const fetchCities = async () => {
			try {
				const cities = await axios.get(
					"/api/v2/cities?type=featured"
				);
				if (!cities.data || cities.data.data.length === 0) {
		return [];
				}else{
                    console.log(cities.data.data);
					setCities(cities.data.data);
				}
			} catch (error) {
				return [];
			}
		};
		fetchCities();
	}, []);

	if (!cities || cities.length === 0) {
		return (
			<section className="w-dvw pl-4 md:pl-12">
				<ScrollArea className="w-full whitespace-nowrap rounded-md">
					<div className=" space-x-2 p-4 flex">
						{Array.from({ length: 7 }).map((_, index) => (
							<Skeleton
								key={index}
								className="h-56 w-44 md:w-48 rounded-2xl shrink-0"
							/>
						))}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</section>
		);
	}

	return (
		<>
			<div className="w-11/12 mx-auto">
				<Carousel
					opts={{
						align: "start",
						loop: true,
					}}>
					<CarouselContent className="my-2">
						{" "}
						{cities.map((city: any, index: number) => {
							return (
								<CarouselItem key={index} className=" basis-auto">
									<Card
										onClick={() => {
											router.replace(
												`/Florida-Real-Estate-Search/${capitalizeWords(
													city.name
												).replaceAll(" ", "-")}`
											);
										}}
										key={index}
										className={`h-64 w-52 md:w-56 group overflow-hidden hover:underline hover:cursor-pointer rounded-xl shrink-0`}>
										<div className="relative">
											<Image
											  unoptimized
												src={city.defaultImage || (Array.isArray(city.images) ? city.images[0] : null) || "/map-bg.webp"}
												width={160}
												height={400}
												className="h-64 w-56 group-hover:scale-110 transition duration-800 ease-in-out md:w-56 opacity-95 rounded-lg"
												alt={`/Florida-Real-Estate-Search/${city.name}`}
											/>
											<div className="h-full w-full pb-16 bg-black/60  rounded-lg absolute top-0 left-0 bg-cover flex flex-col justify-end gap-4 items-center text-center  font-medium text-medium">
												<span className="font-bold  text-white inset-0 text-xl">
													{city.name}
												</span>
												<span className="text-sm font-bold text-gray-100">
													{(city._count?.properties ?? city._count?.communities ?? 0)} Listings
												</span>
											</div>
										</div>
									</Card>
								</CarouselItem>
							);
						})}
					</CarouselContent>
					<CarouselPrevious className="xl:-left-3 w-10 h-10 -left-3 md:bottom-2/6 bottom-2/6 bg-accent " />
					<CarouselNext className="xl:-right-3 w-10 h-10 -right-3 bottom-2/6 md:bottom-2/6 bg-accent" />
				</Carousel>
			</div>
		</>
	);
}
