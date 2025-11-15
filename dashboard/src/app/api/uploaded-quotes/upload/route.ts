import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";

/**
 * POST /api/uploaded-quotes/upload
 * Upload CSV file and extract quotes to database
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const facebookPageId = formData.get("facebookPageId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!facebookPageId) {
      return NextResponse.json(
        { error: "Facebook Page ID is required" },
        { status: 400 }
      );
    }

    // Verify the Facebook Page exists and user has access
    const facebookPage = await prisma.facebookPage.findUnique({
      where: { id: facebookPageId },
    });

    if (!facebookPage) {
      return NextResponse.json(
        { error: "Facebook Page not found" },
        { status: 404 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    // Expected format: text, author, category, source, tags
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "No valid records found in CSV" },
        { status: 400 }
      );
    }

    // Validate required columns
    const requiredColumn = "text";
    if (!records[0].hasOwnProperty(requiredColumn)) {
      return NextResponse.json(
        {
          error: `CSV must have a '${requiredColumn}' column. Found columns: ${Object.keys(
            records[0]
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const quotesToInsert = records
      .filter((record: any) => record.text && record.text.trim())
      .map((record: any) => ({
        text: record.text.trim(),
        author: record.author?.trim() || null,
        category: record.category?.trim() || null,
        source: record.source?.trim() || null,
        tags: record.tags?.trim() || null,
        facebookPageId,
        uploadedById: session.user.id,
      }));

    if (quotesToInsert.length === 0) {
      return NextResponse.json(
        { error: "No valid quotes found in CSV" },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await prisma.uploadedQuote.createMany({
      data: quotesToInsert,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully uploaded ${result.count} quote(s)`,
    });
  } catch (error: any) {
    console.error("Error uploading quotes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload quotes" },
      { status: 500 }
    );
  }
}
