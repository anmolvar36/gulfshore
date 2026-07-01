import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Blog from "@/models/blog"; // adjust path if needed
import connectDB from "@/lib/dbconfig";

// ✅ GET /api/blogs
// - ?slug=example-blog → fetch single blog
// - ?category=market-trends → filter by category
// - ?published=true → show only published blogs
export async function GET(request: any) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const slug = searchParams.get("slug");
		const category = searchParams.get("category");
		const published = searchParams.get("published");
		const limit = Number(searchParams.get("limit")) || 10;

		let query: Record<string, any> = {};

		if (slug) {
			// fetch a single blog by slug
			const blog = await Blog.findOne({
				slug,
				published: true,
			}).lean();
			if (!blog)
				return NextResponse.json(
					{ error: "Blog not found" },
					{ status: 404 }
				);
			return NextResponse.json(blog, { status: 200 });
		}

		// build dynamic query for listing
		if (category) query.category = category;
		if (published === "true") query.published = true;

		const blogs = await Blog.find(query)
			.sort({ publishedAt: -1 })
			.limit(limit)
			.select("title slug description coverImage publishedAt author")
			.lean();

		return NextResponse.json(blogs, { status: 200 });
	} catch (error) {
		console.error("Error fetching blogs:", error);
		return NextResponse.json(
			{ error: "Failed to fetch blogs" },
			{ status: 500 }
		);
	}
}
