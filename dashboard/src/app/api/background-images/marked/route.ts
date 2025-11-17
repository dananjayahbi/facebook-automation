import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch all images marked for deletion
    const images = await prisma.backgroundImage.findMany({
      where: {
        isMarkedForDeletion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        filename: true,
        path: true,
        tags: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error("Error fetching marked images:", error);
    return NextResponse.json(
      { message: "Failed to fetch marked images" },
      { status: 500 }
    );
  }
}
