import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const quotes = await prisma.quote.findMany({
      where: {
        facebookPageId,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { message: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
