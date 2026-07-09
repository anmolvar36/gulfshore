"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface ReadMoreProps {
	children: any;
	maxLength?: number;
	readMoreText?: string;
	readLessText?: string;
	className?: string;
	link?: string;
}

const ReadMore: React.FC<ReadMoreProps> = ({
	children,
	maxLength = 400,
	readMoreText = "Read More",
	readLessText = "Read Less",
	className = "",
	link = "",
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const router = useRouter();

	const textContent = Array.isArray(children)
		? children.join("")
		: typeof children === "string"
		? children
		: "";

	const shouldTruncate = textContent.length > maxLength;

	const toggleExpanded = (e?: React.MouseEvent) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		if (link && typeof link === "string" && link.trim()) {
			router.push(link, {
				scroll: true,
			});
			return;
		}
		setIsExpanded((prev) => !prev);
	};

	const getTruncatedText = (text: string, max: number) => {
		if (text.length <= max) return text;
		const sliced = text.slice(0, max);
		const lastSpace = sliced.lastIndexOf(" ");
		return lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;
	};

	return (
		<div className={className}>
			<p
				className="whitespace-pre-wrap break-words text-black font-normal"
				aria-expanded={isExpanded}>
				<span
					style={{ display: isExpanded ? "inline" : "none" }}
					suppressHydrationWarning>
					{textContent}
				</span>
				<span
					style={{ display: isExpanded ? "none" : "inline" }}
					suppressHydrationWarning>
					{getTruncatedText(textContent, maxLength)}
					{shouldTruncate && "..."}
				</span>
			</p>

			{shouldTruncate &&
				(link ? (
					<Link
						href={link}
						aria-label="read-more"
						className="inline-block mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition-colors cursor-pointer"
						target="_blank">
						Read More
					</Link>
				) : (
					<button
						type="button"
						onClick={toggleExpanded}
						className="inline-flex items-center mt-2.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-lg transition-colors cursor-pointer select-none"
						aria-label={
							isExpanded ? "Collapse content" : "Expand content"
						}>
						{isExpanded ? readLessText : readMoreText}
					</button>
				))}
		</div>
	);
};

export default ReadMore;
