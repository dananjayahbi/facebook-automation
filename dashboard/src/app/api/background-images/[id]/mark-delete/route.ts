import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isMarkedForDeletion } = body;

    if (typeof isMarkedForDeletion !== "boolean") {
      return NextResponse.json(
        { message: "isMarkedForDeletion must be a boolean" },
        { status: 400 }
      );
    }

    // Update the image
    const updatedImage = await prisma.backgroundImage.update({
      where: { id },
      data: { isMarkedForDeletion },
    });

    return NextResponse.json(
      { 
        message: "Mark status updated successfully", 
        isMarkedForDeletion: updatedImage.isMarkedForDeletion 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating mark status:", error);
    return NextResponse.json(
      { message: "Failed to update mark status" },
      { status: 500 }
    );
  }
}
