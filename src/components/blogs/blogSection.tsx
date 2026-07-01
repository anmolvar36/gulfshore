import { BookOpen } from "lucide-react";
import BlogArticleCard from "@/components/blogs/blogCard";

export default async function BlogSection() {
	const fetchBlogArticles = async () => {
		try {
			const response = await fetch(
				"https://gulfshoregroup.com/api/v2/blogs?published=true&limit=4",
				{
					next: { revalidate: 3600 },
				}
			);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Error fetching blog articles:", error);
		}
	};

	const blogArticles = await fetchBlogArticles();

	if (!blogArticles || blogArticles.length === 0) {
		return null; // or a fallback UI
	}

	return (
		<section className="space-y-6 py-12 w-11/12 lg:max-w-4/5 mx-auto">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-2xl font-medium text-foreground flex items-center gap-2">
						<BookOpen className="w-6 h-6 fill-red-400 text-red-200" />
						Real Estate Blogs
					</h3>
					<p className="text-muted-foreground mt-1">
						Tips, trends, and insights from real estate experts
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1  border-y-2 border-gray-100 py-10 md:grid-cols-2 lg:grid-cols-2 gap-4">
				{blogArticles.map((article: any) => (
					<BlogArticleCard key={article._id} article={article} />
				))}
			</div>
		</section>
	);
}
