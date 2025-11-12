import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch user's active Facebook page
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const activePage = await prisma.userActivePage.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        facebookPage: {
          select: {
            id: true,
            name: true,
            description: true,
            pageId: true,
            isActive: true,
          },
        },
      },
    });

    // If no active page set, return the first available page
    if (!activePage) {
      const firstPage = await prisma.facebookPage.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json({ facebookPage: firstPage || null });
    }

    return NextResponse.json(activePage);
  } catch (error) {
    console.error("Error fetching active page:", error);
    return NextResponse.json(
      { message: "Failed to fetch active page" },
      { status: 500 }
    );
  }
}

// POST - Set user's active Facebook page
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { facebookPageId } = body;

    if (!facebookPageId) {
      return NextResponse.json(
        { message: "Facebook page ID is required" },
        { status: 400 }
      );
    }

    // Verify that the Facebook page exists and is active
    const page = await prisma.facebookPage.findUnique({
      where: { id: facebookPageId },
    });

    if (!page) {
      return NextResponse.json(
        { message: "Facebook page not found" },
        { status: 404 }
      );
    }

    if (!page.isActive) {
      return NextResponse.json(
        { message: "Facebook page is not active" },
        { status: 400 }
      );
    }

    // Upsert the user's active page
    const activePage = await prisma.userActivePage.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        facebookPageId,
      },
      create: {
        userId: session.user.id,
        facebookPageId,
      },
      include: {
        facebookPage: {
          select: {
            id: true,
            name: true,
            description: true,
            pageId: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(activePage);
  } catch (error) {
    console.error("Error setting active page:", error);
    return NextResponse.json(
      { message: "Failed to set active page" },
      { status: 500 }
    );
  }
}
