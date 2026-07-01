"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import MarkerItem from "@/components/map/marker";

interface PropertyMapProps {
	property: any;
	Latitude: number;
	Longitude: number;
}

const mapContainerStyle = {
	height: "50vh",
	minHeight: "400px",
	width: "100%",
};

const PropertyMap = ({
	property,
	Latitude,
	Longitude,
}: PropertyMapProps) => {
	const { isLoaded, loadError } = useJsApiLoader({
		id: "google-map",
		googleMapsApiKey:
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
	});

	if (loadError) {
		return (
			<div className="text-red-500 text-sm">
				Failed to load Google Maps. Please try again later.
			</div>
		);
	}

	if (!isLoaded) {
		return <Skeleton className="h-[50vh] min-h-[400px] w-full" />;
	}

	if (!Latitude || !Longitude) {
		return (
			<div className="text-gray-500 text-sm">
				Map location not available for this property.
			</div>
		);
	}

	return (
		<div>
			<h4 className="text-lg lg:text-xl font-medium text-gray-900 mb-4">
				Map View
			</h4>
			<GoogleMap
				mapContainerStyle={mapContainerStyle}
				zoom={15}
				center={{ lat: Latitude, lng: Longitude }}>
				<MarkerItem item={property} handleMarkerClick={""} />
			</GoogleMap>
		</div>
	);
};

export default PropertyMap;
