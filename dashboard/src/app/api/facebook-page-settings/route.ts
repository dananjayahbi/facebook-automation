import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch layout settings for a Facebook Page
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facebookPageId = searchParams.get("facebookPageId");

    if (!facebookPageId) {
      return NextResponse.json(
        { message: "Facebook Page ID is required" },
        { status: 400 }
      );
    }

    // Get or create settings for this Facebook Page
    let settings = await prisma.facebookPageLayoutSettings.findUnique({
      where: { facebookPageId },
    });

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.facebookPageLayoutSettings.create({
        data: {
          facebookPageId,
          showGenerateContent: true,
          showViewContent: true,
          showUploadContent: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching Facebook Page settings:", error);
    return NextResponse.json(
      { message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update layout settings for a Facebook Page
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      facebookPageId,
      showGenerateContent,
      showViewContent,
      showUploadContent,
    } = body;

    if (!facebookPageId) {
      return NextResponse.json(
        { message: "Facebook Page ID is required" },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.facebookPageLayoutSettings.upsert({
      where: { facebookPageId },
      create: {
        facebookPageId,
        showGenerateContent: showGenerateContent ?? true,
        showViewContent: showViewContent ?? true,
        showUploadContent: showUploadContent ?? true,
      },
      update: {
        ...(showGenerateContent !== undefined && { showGenerateContent }),
        ...(showViewContent !== undefined && { showViewContent }),
        ...(showUploadContent !== undefined && { showUploadContent }),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating Facebook Page settings:", error);
    return NextResponse.json(
      { message: "Failed to update settings" },
      { status: 500 }
    );
  }
}
