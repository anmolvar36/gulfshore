import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string; criteriaId: string }> }
) {
	const { id, criteriaId } = await params;

	const lead = await prisma.lead.findUnique({ where: { id } });
	if (!lead)
		return NextResponse.json(
			{ message: "Lead not found" },
			{ status: 404 }
		);

	const existingTags = (lead.tags as any) || {};
	const existingCriteria: any[] = existingTags?.propertyCriteria || [];
	const updatedCriteria = existingCriteria.filter(
		(c: any) => c._id !== criteriaId
	);

	const updated = await prisma.lead.update({
		where: { id },
		data: {
			tags: {
				...existingTags,
				propertyCriteria: updatedCriteria,
			},
		},
	});

	return NextResponse.json({
		...updated,
		_id: updated.id,
		propertyCriteria: updatedCriteria,
	});
}
