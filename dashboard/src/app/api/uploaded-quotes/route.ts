import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/uploaded-quotes
 * Fetch uploaded quotes with server-side pagination
 * Query params: page (default: 1), limit (default: 20), facebookPageId (required)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const facebookPageId = searchParams.get("facebookPageId");

    if (!facebookPageId) {
      return NextResponse.json(
        { error: "Facebook Page ID is required" },
        { status: 400 }
      );
    }

    // Calculate offset
    const skip = (page - 1) * limit;

    // Fetch quotes with pagination
    const [quotes, total] = await Promise.all([
      prisma.uploadedQuote.findMany({
        where: {
          facebookPageId,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.uploadedQuote.count({
        where: {
          facebookPageId,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching uploaded quotes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/uploaded-quotes
 * Delete an uploaded quote by ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    // Delete the quote
    await prisma.uploadedQuote.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Quote deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete quote" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/uploaded-quotes
 * Update an uploaded quote by ID
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, text, author, category, source, tags, isUsed } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Quote text is required" },
        { status: 400 }
      );
    }

    // Update the quote
    const updatedQuote = await prisma.uploadedQuote.update({
      where: { id },
      data: {
        text: text.trim(),
        author: author?.trim() || null,
        category: category?.trim() || null,
        source: source?.trim() || null,
        tags: tags?.trim() || null,
        isUsed: isUsed === true,
      },
    });

    return NextResponse.json({
      success: true,
      quote: updatedQuote,
      message: "Quote updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update quote" },
      { status: 500 }
    );
  }
}
