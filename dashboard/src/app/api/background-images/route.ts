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

    if (searchQuery) {
      // Advanced fuzzy search with priority-based sorting
      // Split search query into words
      const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      
      // Calculate 60% prefix for each word
      const searchPrefixes = searchWords.map((word) => {
        const charCount = Math.round(word.length * 0.6);
        return word.substring(0, Math.max(1, charCount));
      });

      // Fetch all images (we'll do custom sorting in memory)
      const allImages = await prisma.backgroundImage.findMany({
        include: {
          uploadedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Score each image based on tag matches
      const scoredImages = allImages.map((image) => {
        let matchCount = 0;
        
        // Check each tag against search prefixes
        image.tags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          searchPrefixes.forEach((prefix) => {
            if (lowerTag.startsWith(prefix)) {
              matchCount++;
            }
          });
        });

        return {
          image,
          matchCount,
        };
      });

      // Filter out images with no matches and sort by match count (descending)
      const filteredAndSorted = scoredImages
        .filter((item) => item.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .map((item) => item.image);

      // Apply pagination
      const totalCount = filteredAndSorted.length;
      const paginatedImages = filteredAndSorted.slice(skip, skip + limit);

      return NextResponse.json(
        {
          images: paginatedImages,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: skip + paginatedImages.length < totalCount,
          },
        },
        { status: 200 }
      );
    } else {
      // No search query - return all images with pagination
      const [images, totalCount] = await Promise.all([
        prisma.backgroundImage.findMany({
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
        prisma.backgroundImage.count(),
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
    }
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

    // Delete the physical file
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Construct the full file path
      const filePath = path.join(process.cwd(), 'src', 'assets', 'background-images', image.filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted physical file: ${filePath}`);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    } catch (fileError) {
      console.error("Error deleting physical file:", fileError);
      // Don't fail the entire operation if file deletion fails
    }

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
