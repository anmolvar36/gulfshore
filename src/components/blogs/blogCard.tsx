"use client";

import { useRouter } from "next/navigation";
import { Calendar, Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogArticleCardProps {
	article: {
		slug: number;
		title: string;
		description: string;
		author: string;
		publishedAt: string;
		category?: string;
		coverImage: string;
	};
}

export default function BlogArticleCard({
	article,
}: BlogArticleCardProps) {
	const router = useRouter();

	const handleClick = () => {
		router.push(`/blogs/${article.slug}`);
	};

	return (
		<Card
			onClick={handleClick}
			className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer flex flex-col max-w-md h-full">
			<div className="relative h-48 overflow-hidden bg-muted">
				<img
					src={article.coverImage || "/placeholder.svg"}
					alt={article.title}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>
			</div>

			<div className="p-4 flex-1 flex flex-col">
				<div className="mb-3">
					<Badge
						variant="secondary"
						className="bg-secondary text-secondary-foreground">
						{article.category || "General"}
					</Badge>
				</div>

				<h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
					{article.title}
				</h3>

				<p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
					{article.description}
				</p>

				<div className="border-t border-border pt-3 space-y-2">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<User className="w-3.5 h-3.5" />
						<span>{article.author}</span>
					</div>
					<div className="flex gap-4 text-xs text-muted-foreground">
						<div className="flex items-center gap-1">
							<Calendar className="w-3.5 h-3.5" />
							<span>
								{article.publishedAt
									.replaceAll("T", "  ")
									.replaceAll("Z", "")}
							</span>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
