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
			question: `Why are homebuyers moving to and investing in ${displayCity} real estate?`,
			answer: `${displayCity} attracts discerning homebuyers and relocators due to its tax-friendly Florida living, world-class Gulf coast beaches, championship golf communities, and luxury coastal lifestyle. Whether seeking a primary residence, vacation condo, or waterfront estate, buyers consistently choose ${displayCity} for long-term value and exceptional quality of life.`,
		},
		{
			question: `Is it a good time to buy a home in ${displayCity}?`,
			answer: `Yes, investing in ${displayCity} real estate presents strong long-term opportunities. With steady demand for premium single-family homes, beachfront condos, and golf communities across Southwest Florida, buyers benefit from a stable luxury market, rich inventory, and competitive property values tailored to coastal luxury living.`,
		},
		{
			question: `Are home prices and property value trends favorable in ${displayCity}?`,
			answer: `${displayCity} real estate maintains resilient property values supported by strong lifestyle demand and premier Southwest Florida amenities. Working with experienced local real estate professionals ensures you identify strategically priced listings, exclusive developments, and optimal investment opportunities across ${displayCity}.`,
		},
		{
			question: `What budget or lifestyle options are available for living in ${displayCity}?`,
			answer: `${displayCity} offers a broad spectrum of real estate opportunities to match diverse lifestyles and budgets. From maintenance-free condominiums and resort-style gated communities to ultra-luxury waterfront estates with private Gulf boat access, our platform helps you find properties perfectly aligned with your financial and lifestyle goals.`,
		},
		{
			question: `What makes ${displayCity} a top destination for real estate?`,
			answer: `${displayCity} offers a vibrant real estate market with diverse properties ranging from luxury homes to waterfront condos. The area is highly sought after in Southwest Florida for its world-class beaches, exceptional climate, and premium lifestyle amenities, making it a prime location for buying homes for sale.`,
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
