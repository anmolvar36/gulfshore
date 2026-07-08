"use client";
import React, { useRef, useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, MarkerClustererF } from "@react-google-maps/api";
import MarkerItem from "@/components/map/marker";
import { useSelector } from "react-redux";
import { Layers, ChevronDown } from "lucide-react";
import { useAppDispatch } from "@/state/store";
import {
	fetchProperties,
	selectAllProperties,
	selectUi,
	setCoordinates,
	setFilters,
	setLimit,
	setMapCard,
} from "@/state/slices/searchSlice";
import debounce from "@/hooks/useDebounce";
import { SearchParamsResult } from "@/hooks/extractSearchParams";
import { EMPTY_FILTERS } from "@/lib/search-filters";
import { PropertyCard2 } from "@/components/cards/property/property-card";

const mapContainerStyle = {
	width: "100%",
	height: "100%",
} as const;

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
	"NAPLES": { lat: 26.142, lng: -81.7948 },
	"BONITA SPRINGS": { lat: 26.3398, lng: -81.7787 },
	"ESTERO": { lat: 26.4381, lng: -81.8068 },
	"AVE MARIA": { lat: 26.3359, lng: -81.4384 },
	"MARCO ISLAND": { lat: 25.9363, lng: -81.7157 },
	"FORT MYERS": { lat: 26.6406, lng: -81.8723 },
	"BABCOCK RANCH": { lat: 26.8028, lng: -81.7306 },
	"LEHIGH ACRES": { lat: 26.6180, lng: -81.6437 },
	"IMMOKALEE": { lat: 26.4194, lng: -81.4219 },
	"SANIBEL": { lat: 26.4433, lng: -82.0244 },
	"CAPE CORAL": { lat: 26.5629, lng: -81.9495 },
};

export default function MapComponent({
	filterParams,
}: {
	filterParams: SearchParamsResult;
}) {
	const [center, setCenter] = useState({
		lat: 26.142,
		lng: -81.7948,
	});
	const [mapTypeId, setMapTypeId] = useState<"roadmap" | "hybrid">("roadmap");

	const [showDrone, setShowDrone] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const hasCenteredRef = useRef(false);
	const isInitialLoadRef = useRef(true);

	const dispatch = useAppDispatch();
	const properties = useSelector(selectAllProperties);
	const ui = useSelector(selectUi);

	// Sync refs for stable debounce function
	const filtersRef = useRef(ui.filters);
	React.useEffect(() => {
		filtersRef.current = ui.filters;
	}, [ui.filters]);

	const filterParamsRef = useRef(filterParams);
	React.useEffect(() => {
		filterParamsRef.current = filterParams;
		hasCenteredRef.current = false; // Reset centering flag when search query / city parameters change
	}, [filterParams]);

	// Close dropdown when clicking outside
	React.useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Concurrent properties prefetch on mount
	React.useEffect(() => {
		dispatch(
			setFilters({
				...EMPTY_FILTERS,
				...filterParams,
			})
		);
		dispatch(fetchProperties());
	}, [dispatch, filterParams]);

	// Auto-center map EXACTLY ONCE on city search change or initial property load
	React.useEffect(() => {
		if (hasCenteredRef.current) return;

		const searchCity = filterParams?.city?.toUpperCase() || "";
		if (searchCity && CITY_CENTERS[searchCity]) {
			setCenter(CITY_CENTERS[searchCity]);
			hasCenteredRef.current = true;
		} else if (properties.length > 0) {
			const firstWithCoords = properties.find((p: any) => p.Latitude && p.Longitude);
			if (firstWithCoords) {
				setCenter({
					lat: Number(firstWithCoords.Latitude),
					lng: Number(firstWithCoords.Longitude),
				});
				hasCenteredRef.current = true;
			}
		}
	}, [filterParams?.city, properties]);

	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey:
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
			"AIzaSyBQwpzlVeV9AI6FETYYUmLt730XEKRdfAY",
	});

	const mapRef = useRef<google.maps.Map | null>(null);

	const handlemarkerClick = (property: any) => {
		if (
			ui.details === null ||
			ui.details.MLSNumber !== property.MLSNumber
		) {
			dispatch(setMapCard(property));
		} else {
			dispatch(setMapCard(null));
		}
	};

	// Stable debounced refreshData callback (never recreated on filter/state updates)
	const refreshData = useCallback(
		debounce(() => {
			if (!mapRef.current) return;
			if (isInitialLoadRef.current) {
				isInitialLoadRef.current = false;
				return;
			}
			const b = mapRef.current.getBounds();
			if (!b) return;
			const bounds = {
				north: b.getNorthEast().lat(),
				east: b.getNorthEast().lng(),
				south: b.getSouthWest().lat(),
				west: b.getSouthWest().lng(),
			};
			const currentFilters = filtersRef.current;
			const currentParams = filterParamsRef.current;

			if (currentParams && ui.listView === false) {
				const fetchdata = async () => {
					dispatch(
						setFilters({
							...currentFilters,
							...currentParams,
							...bounds,
						})
					);

					dispatch(fetchProperties());
				};
				fetchdata();
			} else {
				dispatch(setCoordinates(bounds));
				dispatch(setLimit(40));
				dispatch(fetchProperties());
			}
		}, 650),
		[dispatch]
	);



	const toggleDroneView = useCallback(() => {
		if (!ui.details) {
			alert("Please select a property marker on the map first to view its Drone / Real View photos.");
			return;
		}
		const hasVirtualTour = ui.details.VirtualTourURLBranded || ui.details.VirtualTourURLUnbranded;
		if (hasVirtualTour) {
			setShowDrone(!showDrone);
			setDropdownOpen(false);
		} else {
			alert("Drone / Real View photos are not available for this property.");
		}
	}, [ui.details, showDrone]);

	const onLoad = useCallback(
		(map: google.maps.Map) => {
			mapRef.current = map;
			map.addListener("idle", refreshData);
		},
		[refreshData]
	);

	const onUnmount = useCallback(() => {
		mapRef.current = null;
	}, []);

	return (
		<div className="h-full w-full grow relative rounded-xl">
			{/* Unified Map controls dropdown card */}
			<div className="absolute top-4 left-4 z-50" ref={dropdownRef}>
				<button
					onClick={() => setDropdownOpen(!dropdownOpen)}
					className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-md font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer"
				>
					<Layers size={16} className="text-[#B89A6A]" />
					<span>Map Options</span>
					<ChevronDown size={14} className="text-gray-400" />
				</button>
				
				{dropdownOpen && (
					<div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 flex flex-col gap-4">
						<div className="flex flex-col gap-3">
							<div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Map Style</div>
							<label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer select-none">
								<input
									type="radio"
									name="mapStyle"
									checked={mapTypeId === "roadmap" && !showDrone}
									onChange={() => { setMapTypeId("roadmap"); setShowDrone(false); }}
									className="w-4 h-4 text-[#B89A6A] focus:ring-[#B89A6A] focus:ring-1"
								/>
								Standard Map
							</label>
							<label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer select-none">
								<input
									type="radio"
									name="mapStyle"
									checked={mapTypeId === "hybrid" && !showDrone}
									onChange={() => { setMapTypeId("hybrid"); setShowDrone(false); }}
									className="w-4 h-4 text-[#B89A6A] focus:ring-[#B89A6A] focus:ring-1"
								/>
								Satellite View
							</label>
						</div>
						
<<<<<<< HEAD
						<div className="h-px bg-gray-100" />
						
						<div className="flex flex-col gap-3">
							<div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overlays & Features</div>
							<label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer select-none">
								<input
									type="checkbox"
									checked={streetViewActive}
									onChange={toggleStreetView}
									className="w-4 h-4 rounded text-[#B89A6A] focus:ring-[#B89A6A] focus:ring-1 cursor-pointer"
								/>
								Street View
							</label>
							<label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer select-none">
								<input
									type="checkbox"
									checked={showFema}
									onChange={toggleFemaLayer}
									className="w-4 h-4 rounded text-[#B89A6A] focus:ring-[#B89A6A] focus:ring-1 cursor-pointer"
								/>
								FEMA Flood Map
							</label>
						</div>

						<div className="h-px bg-gray-100" />
						
						<button 
							className="w-full text-left font-medium text-sm text-primary hover:underline py-1"
							onClick={toggleDroneView}
						>
							{showDrone ? "Return to Map" : "Real View / Drone Photos"}
						</button>
=======
						<div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Drone View</div>
						
						<label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
							<button 
								className="w-full text-left font-semibold text-primary hover:underline"
								onClick={toggleDroneView}
							>
								{showDrone ? "Return to Map" : "Real View / Drone Photos"}
							</button>
						</label>
>>>>>>> 6fa2d5fa041bd698193e132b7319679ae5631a4f
					</div>
				)}
			</div>

			{showDrone && ui.details ? (
				<iframe 
					src={ui.details.VirtualTourURLBranded || ui.details.VirtualTourURLUnbranded} 
					className="w-full h-full border-0 rounded-xl"
					title="Drone / Real View"
				/>
			) : isLoaded && (
				<GoogleMap
					onLoad={onLoad}
					onUnmount={onUnmount}
					center={center}
					zoom={10}
					mapTypeId={mapTypeId}
					mapContainerStyle={mapContainerStyle}
					options={{
						clickableIcons: false,
						mapTypeControl: false,
						streetViewControl: false,
						fullscreenControl: false,
					}}
				>
					<MarkerClustererF>
						{(clusterer) => (
							<>
								{properties.map((item) => (
									<MarkerItem
										key={item.MLSNumber}
										item={item}
										handleMarkerClick={handlemarkerClick}
										clusterer={clusterer}
									/>
								))}
								{ui.details && !properties.includes(ui.details) && (
									<MarkerItem
										key={ui.details.MLSNumber}
										item={ui.details}
										handleMarkerClick={handlemarkerClick}
										clusterer={clusterer}
									/>
								)}
							</>
						)}
					</MarkerClustererF>
				</GoogleMap>
			)}
			{ui.details && !showDrone && (
				<div className=" absolute md:bottom-1 bottom-0 left-1 right-1 z-50">
					<PropertyCard2
						property={ui.details}
						onCardClose={() => dispatch(setMapCard(null))}
					/>
				</div>
			)}
		</div>
	);
}

