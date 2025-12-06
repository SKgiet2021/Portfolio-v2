import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * API endpoint to upload files to knowledge_base
 * POST with multipart/form-data containing files
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const knowledgeBasePath = path.join(process.cwd(), 'knowledge_base');
    
    // Ensure knowledge_base directory exists
    if (!existsSync(knowledgeBasePath)) {
      await mkdir(knowledgeBasePath, { recursive: true });
    }

    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Get file buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename (remove path traversal attempts)
        const safeFilename = path.basename(file.name);
        const filePath = path.join(knowledgeBasePath, safeFilename);

        // Write file
        await writeFile(filePath, buffer);
        uploadedFiles.push(safeFilename);
        
        console.log(`✅ Uploaded: ${safeFilename} (${(buffer.length / 1024).toFixed(2)} KB)`);
      } catch (error: any) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
