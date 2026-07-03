"use client";

interface PropertyMapProps {
	property: any;
	Latitude: number;
	Longitude: number;
}

const mapContainerStyle = {
	height: "50vh",
	minHeight: "400px",
	width: "100%",
	borderRadius: "0.75rem",
	border: "1px solid #e2e8f0",
	overflow: "hidden",
};

const PropertyMap = ({
	property,
	Latitude,
	Longitude,
}: PropertyMapProps) => {
	if (!Latitude || !Longitude) {
		return (
			<div className="text-gray-500 text-sm p-4 bg-gray-50 border rounded-lg text-center">
				Map location not available for this property.
			</div>
		);
	}

	// Centering the Leaflet/OpenStreetMap bounding box around property coordinates
	const delta = 0.003;
	const minLng = Longitude - delta;
	const minLat = Latitude - delta;
	const maxLng = Longitude + delta;
	const maxLat = Latitude + delta;
	const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${Latitude}%2C${Longitude}`;

	return (
		<div>
			<h4 className="text-lg lg:text-xl font-medium text-gray-900 mb-4">
				Map View (OpenStreetMap)
			</h4>
			<div style={mapContainerStyle}>
				<iframe
					title="Property Location Map"
					width="100%"
					height="100%"
					frameBorder="0"
					scrolling="no"
					src={mapUrl}
					style={{ border: 0 }}
				/>
			</div>
		</div>
	);
};

export default PropertyMap;
