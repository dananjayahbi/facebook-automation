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
    const { isFavorite } = body;

    if (typeof isFavorite !== "boolean") {
      return NextResponse.json(
        { message: "isFavorite must be a boolean" },
        { status: 400 }
      );
    }

    // Update the image
    const updatedImage = await prisma.backgroundImage.update({
      where: { id },
      data: { isFavorite },
    });

    return NextResponse.json(
      { 
        message: "Favorite status updated successfully", 
        isFavorite: updatedImage.isFavorite 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating favorite status:", error);
    return NextResponse.json(
      { message: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
