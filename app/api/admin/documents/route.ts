import { NextRequest, NextResponse } from "next/server";
import { deleteDocument, getDocumentDetails } from "@/lib/lance-store";

/**
 * GET - Get detailed list of all indexed documents
 */
export async function GET() {
  try {
    const docs = await getDocumentDetails();
    
    return NextResponse.json({
      documents: docs.map(doc => ({
        name: doc.name,
        chunks: doc.chunks,
        createdAt: doc.createdAt,
        createdAtFormatted: new Date(doc.createdAt).toLocaleString(),
      })),
      total: docs.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Delete a specific document by name
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentName = searchParams.get("name");
    
    if (!documentName) {
      return NextResponse.json({ error: "Document name required" }, { status: 400 });
    }
    
    const success = await deleteDocument(documentName);
    
    if (success) {
      console.log(`🗑️ Document deleted via API: ${documentName}`);
      return NextResponse.json({
        success: true,
        message: `Document "${documentName}" deleted successfully`,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Failed to delete "${documentName}"`,
      }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
