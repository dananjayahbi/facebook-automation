import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Update a Facebook page (SUPERADMIN only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is SUPERADMIN
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { message: "Forbidden: SUPERADMIN access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, pageId, isActive } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (pageId !== undefined) updateData.pageId = pageId;
    if (isActive !== undefined) updateData.isActive = isActive;

    const page = await prisma.facebookPage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(page);
  } catch (error: any) {
    console.error("Error updating Facebook page:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Facebook page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update Facebook page" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a Facebook page (SUPERADMIN only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is SUPERADMIN
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { message: "Forbidden: SUPERADMIN access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.facebookPage.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Facebook page deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting Facebook page:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Facebook page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete Facebook page" },
      { status: 500 }
    );
  }
}
