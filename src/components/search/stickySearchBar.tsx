"use client";
import SortComponent from "./sort";
import { Filters } from "./desktopFilters";
import { Button } from "../ui/button";
import { ChevronDown, List, MapIcon } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import SaveSearchButton from "./saveSearch";
import SearchBox from "../home/searchField";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { fetchProperties, setFilters } from "@/state/slices/searchSlice";
import { buildQueryFromFilters } from "@/lib/search-filters";
import { formatPrice } from "@/hooks/formatPrice";
import { propertyTypeOptions } from "./desktopFilters";

const PRICE_OPTIONS = [
	"",
	"100000",
	"200000",
	"300000",
	"500000",
	"750000",
	"1000000",
	"2000000",
	"3000000",
	"5000000",
];

export default function StickySearchBar() {
	const path = usePathname();
	const router = useRouter();
	const params = useSearchParams();
	const view = params.get("view");
	const dispatch = useDispatch<AppDispatch>();
	const { filters } = useSelector((state: RootState) => state.search);

	const onQuickPriceChange = (minPrice: string, maxPrice: string) => {
		const nextFilters = {
			...filters,
			minPrice,
			maxPrice,
			page: "1",
		};
		const nextParams = buildQueryFromFilters(nextFilters, params);
		dispatch(setFilters(nextFilters));
		router.replace(`${path}?${nextParams.toString()}`, { scroll: false });
		dispatch(fetchProperties());
		window.scrollTo({ top: 0, behavior: "smooth" });
		document.getElementById("container")?.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	const onQuickPropertyTypeToggle = (value: string, checked: boolean) => {
		const nextTypes = checked
			? [...filters.propertyTypes, value]
			: filters.propertyTypes.filter((t) => t !== value);
		const nextFilters = {
			...filters,
			propertyTypes: nextTypes,
			page: "1",
		};
		const nextParams = buildQueryFromFilters(nextFilters, params);
		dispatch(setFilters(nextFilters));
		router.replace(`${path}?${nextParams.toString()}`, { scroll: false });
		dispatch(fetchProperties());
		window.scrollTo({ top: 0, behavior: "smooth" });
		document.getElementById("container")?.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	const quickPriceLabel =
		filters.minPrice || filters.maxPrice
			? `${filters.minPrice ? formatPrice(Number(filters.minPrice)) : "Any"} - ${
					filters.maxPrice ? formatPrice(Number(filters.maxPrice)) : "Any"
			  }`
			: "Price";

	return (
		<div className="sticky px-3 md:px-4 border-b border-gray-200 gap-2 h-min py-2 flex flex-col md:flex-row justify-center items-center top-0 inset-0 z-50 bg-white/95 backdrop-blur-sm">
			<div className="w-full md:w-auto flex items-center justify-between gap-2">
				<SearchBox classname="w-full md:min-w-[320px] lg:min-w-[400px] flex justify-between p-1 rounded-md bg-white items-center gap-1 border" />
			</div>

			<div className="w-full md:w-auto overflow-x-auto">
				<div className="flex gap-2 items-center min-w-max pb-1 md:pb-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className="rounded-md shadow-none border-gray-200 md:h-10"
							variant="outline">
							{quickPriceLabel}
							<ChevronDown size={14} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-72 p-3">
						<div className="grid grid-cols-2 gap-2">
							{PRICE_OPTIONS.map((min) => {
								const max = min ? "" : "";
								return (
									<Button
										key={`min-${min || "any"}`}
										variant="ghost"
										size="sm"
										onClick={() => onQuickPriceChange(min, max)}
										className="justify-start">
										{min ? `From ${formatPrice(Number(min))}` : "Any price"}
									</Button>
								);
							})}
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className="rounded-md shadow-none border-gray-200 md:h-10"
							variant="outline">
							Property Type
							<ChevronDown size={14} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{propertyTypeOptions.map((type) => (
							<DropdownMenuCheckboxItem
								key={type.value}
								checked={filters.propertyTypes.includes(type.value)}
								onCheckedChange={(checked) =>
									onQuickPropertyTypeToggle(type.value, Boolean(checked))
								}>
								{type.label}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<Filters />
				<SortComponent />
				<a
					className="hidden md:block"
					href={`${path}?${(() => {
						const next = new URLSearchParams(params.toString());
						next.set("view", view === "map" ? "list" : "map");
						return next.toString();
					})()}`}>
					<Button
						className="rounded-md shadow-none border-gray-200 md:h-10"
						variant="outline">
						{view === "map" ? (
							<>
								<List /> List View
							</>
						) : (
							<>
								<MapIcon /> Map View
							</>
						)}
					</Button>
				</a>
				<SaveSearchButton />
			</div>
			</div>
		</div>
	);
}
