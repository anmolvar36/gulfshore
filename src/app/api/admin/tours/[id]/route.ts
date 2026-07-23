import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await req.json();
		const { status } = body;

		if (!status) {
			return NextResponse.json(
				{ success: false, error: "Status is required" },
				{ status: 400 }
			);
		}

		const updatedTour = await prisma.scheduleTour.update({
			where: { id },
			data: { status },
		});

		return NextResponse.json({ success: true, tour: updatedTour });
	} catch (error: any) {
		console.error("Error updating tour status:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await prisma.scheduleTour.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: "Tour request deleted successfully",
		});
	} catch (error: any) {
		console.error("Error deleting tour request:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
