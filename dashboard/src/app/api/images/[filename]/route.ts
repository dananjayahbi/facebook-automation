import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as fs from "fs";
import * as path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");
    
    // Security: validate filename to prevent directory traversal
    if (!filename || filename.includes("..")) {
      return NextResponse.json({ message: "Invalid filename" }, { status: 400 });
    }

    // Construct the image path based on whether pageId is provided
    let imagePath: string;
    if (pageId) {
      // Validate pageId to prevent directory traversal
      if (pageId.includes("..") || pageId.includes("/") || pageId.includes("\\")) {
        return NextResponse.json({ message: "Invalid page ID" }, { status: 400 });
      }
      imagePath = path.join(process.cwd(), "src", "assets", "gen-images", pageId, filename);
    } else {
      // Legacy support for flat structure
      imagePath = path.join(process.cwd(), "src", "assets", "gen-images", filename);
    }

    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(imagePath);
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { message: "Failed to serve image" },
      { status: 500 }
    );
  }
}
