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
    // Let Prisma use schema defaults for all fields
    if (!settings) {
      settings = await prisma.facebookPageLayoutSettings.create({
        data: {
          facebookPageId,
          // Prisma will use @default(true) from schema for all boolean fields
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
    const { facebookPageId, ...settingsToUpdate } = body;

    if (!facebookPageId) {
      return NextResponse.json(
        { message: "Facebook Page ID is required" },
        { status: 400 }
      );
    }

    // Extract only boolean fields for settings (filter out non-boolean values)
    const booleanSettings: Record<string, boolean> = {};
    for (const key in settingsToUpdate) {
      if (typeof settingsToUpdate[key] === 'boolean') {
        booleanSettings[key] = settingsToUpdate[key];
      }
    }

    // Get existing settings to preserve fields not being updated
    const existingSettings = await prisma.facebookPageLayoutSettings.findUnique({
      where: { facebookPageId },
    });

    // Update or create settings with all boolean fields
    const settings = await prisma.facebookPageLayoutSettings.upsert({
      where: { facebookPageId },
      create: {
        facebookPageId,
        // Merge schema defaults with provided settings
        ...booleanSettings,
      },
      update: booleanSettings, // Only update the provided fields
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
