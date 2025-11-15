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

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No images provided" },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { message: `Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        );
      }
    }

    // Ensure background-images directory exists
    const uploadsDir = path.join(process.cwd(), "src", "assets", "background-images");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const savedImages = [];

    // Process each file
    for (const file of files) {
      // Generate unique filename
      const imageId = uuidv4();
      const ext = path.extname(file.name);
      const filename = `${imageId}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      const relativePath = `src/assets/background-images/${filename}`;

      // Convert File to Buffer and save
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      // Save to database
      const savedImage = await prisma.backgroundImage.create({
        data: {
          filename,
          path: relativePath,
          uploadedById: session.user.id,
        },
        include: {
          uploadedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      savedImages.push(savedImage);
    }

    return NextResponse.json(
      {
        message: `Successfully uploaded ${savedImages.length} image(s)`,
        images: savedImages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { message: "An error occurred while uploading images" },
      { status: 500 }
    );
  }
}
