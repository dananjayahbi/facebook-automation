import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { imageData, prompt, model, aspectRatio, facebookPageId } = await request.json();

    if (!imageData || !prompt) {
      return NextResponse.json(
        { message: "Image data and prompt are required" },
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

    // Create unique filename with UUID
    const imageId = uuidv4();
    const filename = `${imageId}.jpg`;
    
    // Create page-specific directory structure
    const imagePath = path.join(
      process.cwd(), 
      "src", 
      "assets", 
      "gen-images", 
      facebookPageId, 
      filename
    );

    // Ensure page-specific directory exists
    const dirPath = path.dirname(imagePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Extract base64 data and save image
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(imagePath, buffer);

    const relativePath = `src/assets/gen-images/${facebookPageId}/${filename}`;

    // Save background to database
    const savedBackground = await prisma.background.create({
      data: {
        prompt,
        imageUrl: relativePath,
        generatedBy: model || null,
        aspectRatio: aspectRatio || null,
        facebookPageId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(
      { 
        message: "Image saved successfully",
        imagePath: relativePath,
        imageId,
        background: savedBackground
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json(
      { message: "An error occurred while saving image" },
      { status: 500 }
    );
  }
}
