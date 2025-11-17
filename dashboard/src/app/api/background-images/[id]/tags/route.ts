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
    const { tags } = body;

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { message: "Tags must be an array" },
        { status: 400 }
      );
    }

    // Validate tags
    const validTags = tags
      .filter((tag) => typeof tag === "string" && tag.trim())
      .map((tag) => tag.trim().toLowerCase());

    // Update the image
    const updatedImage = await prisma.backgroundImage.update({
      where: { id },
      data: { tags: validTags },
    });

    return NextResponse.json(
      { message: "Tags updated successfully", tags: updatedImage.tags },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tags:", error);
    return NextResponse.json(
      { message: "Failed to update tags" },
      { status: 500 }
    );
  }
}
