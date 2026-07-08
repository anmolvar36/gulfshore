import React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import capitalizeWords from "@/hooks/capitalize-letter";

export default function CityFAQ({ city }: { city?: string | null }) {
	const displayCity = city ? capitalizeWords(city.replaceAll("-", " ")) : "Southwest Florida";

	const faqs = [
		{
			question: `What makes ${displayCity} a top destination for real estate?`,
			answer: `${displayCity} offers a vibrant real estate market with diverse properties ranging from luxury homes to waterfront condos. The area is highly sought after in Southwest Florida for its world-class beaches, exceptional climate, and premium lifestyle amenities, making it a prime location for buying homes for sale.`,
		},
		{
			question: `Are there luxury homes for sale in ${displayCity}?`,
			answer: `Yes, ${displayCity} features an exclusive selection of luxury homes. Buyers can explore premium real estate options including beachfront estates, golf course communities, and custom-built mansions. The luxury real estate market in Southwest Florida provides unparalleled living experiences for discerning buyers.`,
		},
		{
			question: `Is it a good time to invest in ${displayCity} real estate?`,
			answer: `Investing in ${displayCity} real estate remains a strong opportunity. With consistent demand for homes for sale and vacation properties in Southwest Florida, buyers can find excellent value. Whether you are looking for a primary residence or an investment property, the market offers great long-term potential.`,
		},
		{
			question: `How can I find the best homes for sale in ${displayCity}?`,
			answer: `Our comprehensive real estate search platform allows you to browse all active homes for sale in ${displayCity}. You can filter by price, property type, and specific amenities like pools or Gulf access to find the perfect property that meets your lifestyle needs in Southwest Florida.`,
		},
	];

	return (
		<div className="w-11/12 mx-auto my-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
			<h2 className="text-2xl font-semibold mb-6 text-gray-900">
				Frequently Asked Questions About {displayCity} Real Estate
			</h2>
			<Accordion type="single" collapsible className="w-full">
				{faqs.map((faq, index) => (
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger className="text-left font-medium text-gray-800 hover:text-(--primary-color)">
							{faq.question}
						</AccordionTrigger>
						<AccordionContent className="text-gray-600 leading-relaxed text-base">
							{faq.answer}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
