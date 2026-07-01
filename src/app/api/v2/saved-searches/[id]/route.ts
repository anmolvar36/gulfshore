import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbconfig";
import SavedSearch from "@/models/saved-search";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await connectDB();
		const id = (await params).id;

		const search = await SavedSearch.findById(id);

		if (!search) {
			return NextResponse.json(
				{ error: "Saved search not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(search);
	} catch (error) {
		console.error("Error fetching saved search:", error);
		return NextResponse.json(
			{ error: "Failed to fetch saved search" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await connectDB();
		const id = (await params).id;

		const body = await request.json();
		const {
			name,
			link,
			filters,
			subscriptionFrequency,
			subscriptionEnabled,
		} = body;
		const updatedSearch = await SavedSearch.findByIdAndUpdate(
			id,
			{
				name,
				link,
				filters,
				subscriptionEnabled,
				subscriptionFrequency,
				lastUpdated: new Date(),
			},
			{ new: true, runValidators: true }
		);

		if (!updatedSearch) {
			return NextResponse.json(
				{ error: "Saved search not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(updatedSearch);
	} catch (error) {
		console.error("Error updating saved search:", error);
		return NextResponse.json(
			{ error: "Failed to update saved search" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = (await params).id;

		await connectDB();

		const deletedSearch = await SavedSearch.findByIdAndDelete(id);

		if (!deletedSearch) {
			return NextResponse.json(
				{ error: "Saved search not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Search deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting saved search:", error);
		return NextResponse.json(
			{ error: "Failed to delete saved search" },
			{ status: 500 }
		);
	}
}
