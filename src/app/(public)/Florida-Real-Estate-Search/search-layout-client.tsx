"use client";
import React from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Map from "./map";
import { SearchParamsResult } from "@/hooks/extractSearchParams";
import { Button } from "@/components/ui/button";
import { List, MapIcon } from "lucide-react";

export default function SearchLayoutClient({
	filterParams,
	children,
}: {
	filterParams: SearchParamsResult;
	children: React.ReactNode;
}) {
	const searchParams = useSearchParams();
	const view = searchParams.get("view");
	const isMapView = view === "map";
	const path = usePathname();

	return (
		<div className="flex w-full h-full relative">
			{/* Left side: Map (only renders when isMapView is true) */}
			{isMapView && (
				<div className="w-full h-full">
					<Map filterParams={filterParams} />
				</div>
			)}

			{/* Right side: List View and Community Info (hidden when in Map view) */}
			<div
				className={`${
					isMapView
						? "hidden"
						: "w-full relative bg-white mx-auto overflow-hidden flex flex-col"
				}`}
			>
				{children}
			</div>

			{/* Universal Floating Toggle Button for Mobile */}
			<a
				className="fixed bottom-3 z-50 right-3 md:hidden"
				href={`${path}?${(() => {
					const next = new URLSearchParams(searchParams.toString());
					next.set("view", isMapView ? "list" : "map");
					return next.toString();
				})()}`}
			>
				<Button
					className="rounded-lg shadow-lg border-gray-900 bg-black text-white md:h-10 px-4 py-2 flex items-center gap-1.5"
					variant="outline"
				>
					{isMapView ? (
						<>
							<List className="w-4 h-4" /> <span>List View</span>
						</>
					) : (
						<>
							<MapIcon className="w-4 h-4" /> <span>Map View</span>
						</>
					)}
				</Button>
			</a>
		</div>
	);
}
