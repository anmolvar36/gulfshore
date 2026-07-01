"use client";
import React, { useRef, useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import MarkerItem from "@/components/map/marker";
import { useSelector } from "react-redux";
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
import { PropertyCard2 } from "@/components/cards/property/property-card";

const mapContainerStyle = {
	width: "100%",
	height: "100vh",
} as const;

export default function MapComponent({
	filterParams,
}: {
	filterParams: SearchParamsResult;
}) {
	const [center, setCenter] = useState({
		lat: 26.142,
		lng: -81.7948,
	});
	const dispatch = useAppDispatch();
	const properties = useSelector(selectAllProperties);
	const ui = useSelector(selectUi);

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

	const refreshData = useCallback(
		debounce(() => {
			if (!mapRef.current) return;
			const b = mapRef.current.getBounds();
			if (!b) return;
			const bounds = {
				north: b.getNorthEast().lat(),
				east: b.getNorthEast().lng(),
				south: b.getSouthWest().lat(),
				west: b.getSouthWest().lng(),
			};
			if (filterParams && ui.listView === false) {
				const fetchdata = async () => {
					dispatch(
						setFilters({
							...ui.filters,
							...filterParams,
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
		[ui.filters]
	);

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
		<div className="md:max-w-1/2  xl:max-w-1/2 xl:min-w-1/2 lg:max-w-3/5 lg:min-w-3/5 md:min-w-1/2 max-h-[80svh] min-w-[100svw] grow relative rounded-xl">
			{isLoaded && (
				<GoogleMap
					onLoad={onLoad}
					onUnmount={onUnmount}
					center={center}
					zoom={10}
					mapContainerStyle={mapContainerStyle}
					options={{ clickableIcons: false }}>
					{[
						properties.map((item) => (
							<MarkerItem
								key={item.MLSNumber}
								item={item}
								handleMarkerClick={handlemarkerClick}
							/>
						)),
						ui.details && !properties.includes(ui.details) && (
							<MarkerItem
								key={ui.details.MLSNumber}
								item={ui.details}
								handleMarkerClick={handlemarkerClick}
							/>
						),
					]}
				</GoogleMap>
			)}
			{ui.details && (
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
