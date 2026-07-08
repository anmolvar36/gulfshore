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
	// On desktop: always show both. On mobile: toggle.
	const isMobileMapOnly = view === "map";
	const path = usePathname();

	const toggleUrl = `${path}?${(() => {
		const next = new URLSearchParams(searchParams.toString());
		next.set("view", isMobileMapOnly ? "list" : "map");
		return next.toString();
	})()}`;

	return (
		<div className="flex w-full h-full relative">

			{/* === DESKTOP: Map always visible on LEFT sidebar === */}
			{/* === MOBILE: Map only shown when isMobileMapOnly === */}
			<div
				className={`
					flex-shrink-0
					md:block md:w-[42%] lg:w-[45%] xl:w-[48%] md:h-full
					${isMobileMapOnly ? "block w-full h-full" : "hidden"}
				`}
			>
				<Map filterParams={filterParams} />
			</div>

			{/* === DESKTOP: Property list on RIGHT === */}
			{/* === MOBILE: List only shown when NOT in map view === */}
			<div
				className={`
					flex-1 overflow-y-auto overflow-x-hidden bg-white flex flex-col
					${isMobileMapOnly ? "hidden" : "block"}
					md:block
				`}
			>
				{children}
			</div>

			{/* Mobile toggle button (only visible on mobile) */}
			<a
				className="fixed bottom-3 z-50 right-3 md:hidden"
				href={toggleUrl}
			>
				<Button className="rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-gray-800 bg-gray-900 text-white hover:bg-black hover:text-white px-5 py-2.5 flex items-center gap-2 font-medium">
					{isMobileMapOnly ? (
						<><List className="w-4 h-4" /> <span>List View</span></>
					) : (
						<><MapIcon className="w-4 h-4" /> <span>Map View</span></>
					)}
				</Button>
			</a>
		</div>
	);
}

