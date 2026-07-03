"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface ReadMoreProps {
	children: string;
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
	const shouldTruncate = children.length > maxLength;

	const toggleExpanded = () => {
		if (link && typeof link === "string" && link.trim()) {
			router.push(link, {
				scroll: true,
			});
			return;
		}
		setIsExpanded(!isExpanded);
	};

	return (
		<div className={className}>
			<p
				className="whitespace-pre-wrap break-words text-black font-normal"
				aria-expanded={isExpanded}>
				<span
					style={{ display: isExpanded ? "inline" : "none" }}
					suppressHydrationWarning>
					{children}
				</span>
				<span
					style={{ display: isExpanded ? "none" : "inline" }}
					suppressHydrationWarning>
					{children.slice(0, maxLength)}...
				</span>
			</p>

			{shouldTruncate &&
				(link ? (
					<Link
						href={link}
						aria-label="read-more"
						className="text-blue-600 hover:underline"
						target="_blank">
						Read More
					</Link>
				) : (
					<button
						onClick={toggleExpanded}
						className="mt-2 text-blue-600 hover:underline focus:outline-none"
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
