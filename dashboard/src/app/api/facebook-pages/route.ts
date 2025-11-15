import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch all Facebook pages (filtered by user role and query parameters)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    // If includeInactive is true and user is SUPERADMIN, return all pages
    // Otherwise, return only active pages
    const whereClause = (includeInactive && session.user.role === "SUPERADMIN") 
      ? {} 
      : { isActive: true };

    const pages = await prisma.facebookPage.findMany({
      where: whereClause,
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        pageId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching Facebook pages:", error);
    return NextResponse.json(
      { message: "Failed to fetch Facebook pages" },
      { status: 500 }
    );
  }
}

// POST - Create a new Facebook page (SUPERADMIN only)
export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, description, pageId } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Page name is required" },
        { status: 400 }
      );
    }

    const page = await prisma.facebookPage.create({
      data: {
        name,
        description: description || null,
        pageId: pageId || null,
        isActive: true,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating Facebook page:", error);
    return NextResponse.json(
      { message: "Failed to create Facebook page" },
      { status: 500 }
    );
  }
}
