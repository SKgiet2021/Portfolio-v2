import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * API endpoint to delete files from knowledge_base
 * DELETE with filename in request body
 */
export async function DELETE(request: NextRequest) {
  try {
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    // Prevent path traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'knowledge_base', safeFilename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the file
    await unlink(filePath);
    console.log(`🗑️  Deleted: ${safeFilename}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${safeFilename}`,
      deletedFile: safeFilename,
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
