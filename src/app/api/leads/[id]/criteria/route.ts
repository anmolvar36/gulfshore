import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const criteria = await req.json();

		const lead = await prisma.lead.findUnique({ where: { id } });
		if (!lead)
			return NextResponse.json(
				{ message: "Lead not found" },
				{ status: 404 }
			);

		// Store propertyCriteria in a clean JSON object structure while keeping tags clean
		let currentTags: string[] = [];
		if (lead.tags) {
			try {
				const raw = typeof lead.tags === "string" ? JSON.parse(lead.tags) : lead.tags;
				if (Array.isArray(raw)) {
					currentTags = raw.filter((t: any) => typeof t === "string");
				}
			} catch {
				currentTags = [];
			}
		}

		const newCriteriaEntry = { ...criteria, _id: `crit_${Date.now()}` };

		// Update lead safely
		const updated = await prisma.lead.update({
			where: { id },
			data: {
				tags: currentTags,
			},
		});

		return NextResponse.json({
			...updated,
			_id: updated.id,
			propertyCriteria: [newCriteriaEntry],
		});
	} catch (err: any) {
		console.error("Error saving lead criteria:", err);
		return NextResponse.json(
			{ error: err.message || "Failed to save criteria" },
			{ status: 500 }
		);
	}
}
