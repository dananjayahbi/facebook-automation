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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const searchQuery = searchParams.get("search") || "";

    // Build where clause for search
    const whereClause = searchQuery
      ? {
          OR: [
            {
              tags: {
                hasSome: searchQuery.toLowerCase().split(/\s+/).filter(Boolean),
              },
            },
            {
              filename: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    // Fetch images with pagination and optional search
    const [images, totalCount] = await Promise.all([
      prisma.backgroundImage.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          uploadedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.backgroundImage.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json(
      {
        images,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + images.length < totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching background images:", error);
    return NextResponse.json(
      { message: "Failed to fetch background images" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a background image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Image ID is required" },
        { status: 400 }
      );
    }

    // Find the image
    const image = await prisma.backgroundImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json(
        { message: "Image not found" },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.backgroundImage.delete({
      where: { id },
    });

    // Optionally delete the physical file (commented out for safety)
    // const fs = require('fs');
    // if (fs.existsSync(image.path)) {
    //   fs.unlinkSync(image.path);
    // }

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
