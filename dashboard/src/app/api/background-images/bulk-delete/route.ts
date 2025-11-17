import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // First, fetch all images marked for deletion to get their filenames
    const markedImages = await prisma.backgroundImage.findMany({
      where: {
        isMarkedForDeletion: true,
      },
      select: {
        id: true,
        filename: true,
      },
    });

    // Delete from database
    const result = await prisma.backgroundImage.deleteMany({
      where: {
        isMarkedForDeletion: true,
      },
    });

    // Delete physical files
    const fs = require('fs');
    const path = require('path');
    let deletedFilesCount = 0;

    for (const image of markedImages) {
      try {
        const filePath = path.join(process.cwd(), 'src', 'assets', 'background-images', image.filename);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFilesCount++;
          console.log(`Deleted physical file: ${filePath}`);
        } else {
          console.warn(`File not found: ${filePath}`);
        }
      } catch (fileError) {
        console.error(`Error deleting file ${image.filename}:`, fileError);
        // Continue with other files even if one fails
      }
    }

    console.log(`Bulk delete: ${result.count} DB records deleted, ${deletedFilesCount} files deleted`);

    return NextResponse.json(
      { 
        message: `Successfully deleted ${result.count} image(s)`,
        deletedCount: result.count,
        filesDeleted: deletedFilesCount
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error bulk deleting images:", error);
    return NextResponse.json(
      { message: "Failed to bulk delete images" },
      { status: 500 }
    );
  }
}
