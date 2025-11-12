import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { quote, author, category, facebookPageId, model } = await request.json();

    if (!quote) {
      return NextResponse.json(
        { message: "Quote text is required" },
        { status: 400 }
      );
    }

    if (!facebookPageId) {
      return NextResponse.json(
        { message: "Facebook Page ID is required" },
        { status: 400 }
      );
    }

    // Verify that the Facebook page exists and is active
    const facebookPage = await prisma.facebookPage.findUnique({
      where: { id: facebookPageId },
    });

    if (!facebookPage) {
      return NextResponse.json(
        { message: "Facebook page not found" },
        { status: 404 }
      );
    }

    if (!facebookPage.isActive) {
      return NextResponse.json(
        { message: "Facebook page is not active" },
        { status: 400 }
      );
    }

    // Save quote to database
    const savedQuote = await prisma.quote.create({
      data: {
        text: quote,
        author: author || null,
        category: category || null,
        generatedBy: model || null,
        facebookPageId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(
      { 
        message: "Quote saved successfully",
        quote: savedQuote
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving quote:", error);
    return NextResponse.json(
      { message: "An error occurred while saving quote" },
      { status: 500 }
    );
  }
}
