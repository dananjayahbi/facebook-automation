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
    const facebookPageId = searchParams.get("facebookPageId");

    if (!facebookPageId) {
      return NextResponse.json(
        { message: "Facebook Page ID is required" },
        { status: 400 }
      );
    }

    // Fetch all quotes for the selected Facebook page
    const quotes = await prisma.uploadedQuote.findMany({
      where: {
        facebookPageId,
      },
      include: {
        uploadedBy: {
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

    // Convert to CSV
    const headers = [
      "text",
      "author",
      "category",
      "source",
      "tags",
      "isUsed",
      "uploadedBy",
      "createdAt",
      "updatedAt",
    ];

    const csvRows = [headers.join(",")];

    quotes.forEach((quote) => {
      const row = [
        `"${(quote.text || "").replace(/"/g, '""')}"`, // Escape quotes in text
        `"${(quote.author || "").replace(/"/g, '""')}"`,
        `"${(quote.category || "").replace(/"/g, '""')}"`,
        `"${(quote.source || "").replace(/"/g, '""')}"`,
        `"${(quote.tags || "").replace(/"/g, '""')}"`,
        quote.isUsed ? "Yes" : "No",
        `"${quote.uploadedBy.name || quote.uploadedBy.email}"`,
        new Date(quote.createdAt).toISOString(),
        new Date(quote.updatedAt).toISOString(),
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="quotes_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { message: "Failed to export quotes" },
      { status: 500 }
    );
  }
}
