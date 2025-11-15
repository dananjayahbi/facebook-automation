import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const backgroundId = searchParams.get("id");

    if (!backgroundId) {
      return NextResponse.json(
        { message: "Background ID is required" },
        { status: 400 }
      );
    }

    // Fetch the background from database
    const background = await prisma.background.findUnique({
      where: { id: backgroundId },
    });

    if (!background) {
      return NextResponse.json(
        { message: "Background not found" },
        { status: 404 }
      );
    }

    // Check if user owns this background or is admin
    if (background.createdById !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { message: "You don't have permission to delete this background" },
        { status: 403 }
      );
    }

    // Delete the physical image file
    if (background.imageUrl) {
      const fullImagePath = path.join(process.cwd(), background.imageUrl);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
      }
    }

    // Delete from database
    await prisma.background.delete({
      where: { id: backgroundId },
    });

    return NextResponse.json({ message: "Background deleted successfully" });
  } catch (error) {
    console.error("Error deleting background:", error);
    return NextResponse.json(
      { message: "Failed to delete background" },
      { status: 500 }
    );
  }
}
