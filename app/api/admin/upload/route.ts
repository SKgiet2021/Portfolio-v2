import { NextRequest, NextResponse } from "next/server";
import { extractText } from "@/lib/pdf-parser";
import { chunkText, estimateTokens } from "@/lib/chunker";
import { embed, embedBatch } from "@/lib/embeddings";
import { upsertDocument, clearAll, listDocuments, getChunkCount } from "@/lib/lance-store";
import { analyzeImage, isImageFile } from "@/lib/image-parser";

// Performance logging helper
function logStep(step: string, startTime: number, details?: string) {
  const elapsed = Date.now() - startTime;
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
  console.log(`[${timestamp}] ⏱️ ${step.padEnd(25)} ${elapsed.toString().padStart(6)}ms ${details || ''}`);
}

export async function POST(req: NextRequest) {
  const totalStart = Date.now();
  console.log("\n" + "═".repeat(60));
  console.log("📤 UPLOAD REQUEST STARTED");
  console.log("═".repeat(60));

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validation: Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const mimeType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log(`📄 File: ${file.name}`);
    console.log(`📦 Size: ${(file.size / 1024).toFixed(1)} KB`);
    console.log(`📋 Type: ${mimeType}`);
    console.log("─".repeat(60));

    let text: string;
    let metadata: any = {};
    let isImage = false;

    // Check if it's an image file
    if (isImageFile(mimeType)) {
      // ============================================
      // IMAGE PROCESSING PATH
      // ============================================
      isImage = true;
      console.log("🖼️ Processing as IMAGE...");
      
      let stepStart = Date.now();
      const { metadata: imageMetadata, textDescription } = await analyzeImage(buffer, mimeType, file.name);
      logStep("Image analysis (Gemini)", stepStart);
      
      text = textDescription;
      metadata = {
        type: "image",
        imageMetadata,
        peopleCount: imageMetadata.people.count,
        objectCount: imageMetadata.objects.length,
        tags: imageMetadata.tags,
      };
      
      console.log(`👥 People: ${imageMetadata.people.count}`);
      console.log(`🐾 Animals: ${imageMetadata.animals.join(", ") || "none"}`);
      console.log(`📦 Objects: ${imageMetadata.objects.slice(0, 5).join(", ")}`);
      console.log(`☀️ Weather: ${imageMetadata.weather}`);
      console.log(`🏷️ Tags: ${imageMetadata.tags.slice(0, 8).join(", ")}`);
      
    } else {
      // ============================================
      // TEXT/PDF PROCESSING PATH
      // ============================================
      console.log("📝 Processing as TEXT/PDF...");
      
      let stepStart = Date.now();
      const extracted = await extractText(buffer, mimeType, file.name);
      text = extracted.text;
      metadata = extracted.metadata;
      logStep("Text extraction", stepStart, `${text.length} chars, ${metadata.pages || 1} pages`);
    }

    // Step 2: Chunk the text
    let stepStart = Date.now();
    const chunks = chunkText(text, {
      chunkSize: 512,
      chunkOverlap: 50,
    });
    logStep("Chunking", stepStart, `${chunks.length} chunks`);

    // Step 3: Generate embeddings for all chunks
    stepStart = Date.now();
    const textsToEmbed = chunks.map(c => c.text);
    const embeddings = await embedBatch(textsToEmbed);
    logStep("Embedding generation", stepStart, `${embeddings.length} embeddings`);

    // Step 4: Store in LanceDB
    stepStart = Date.now();
    const chunksWithEmbeddings = chunks.map((chunk, i) => ({
      text: chunk.text,
      embedding: embeddings[i],
      index: i,
    }));

    await upsertDocument(file.name, chunksWithEmbeddings);
    logStep("LanceDB storage", stepStart, `${chunksWithEmbeddings.length} vectors`);

    // Calculate stats
    const totalTokens = chunks.reduce((acc, c) => acc + estimateTokens(c.text), 0);

    console.log("─".repeat(60));
    logStep("TOTAL TIME", totalStart);
    console.log("═".repeat(60));
    console.log("✅ UPLOAD COMPLETE");
    console.log("═".repeat(60) + "\n");

    return NextResponse.json({
      success: true,
      message: isImage 
        ? `Image analyzed and indexed: ${file.name}`
        : `Document indexed: ${file.name}`,
      type: isImage ? "image" : "document",
      stats: {
        pages: metadata.pages || 1,
        chunks: chunks.length,
        totalTokens,
        avgChunkTokens: Math.round(totalTokens / chunks.length),
        ...(isImage && {
          peopleCount: metadata.peopleCount,
          objectCount: metadata.objectCount,
          tags: metadata.tags,
        }),
      },
    });

  } catch (error: any) {
    console.error("❌ Upload error:", error);
    console.log("═".repeat(60) + "\n");
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

/**
 * GET - List indexed documents
 */
export async function GET() {
  try {
    const docs = await listDocuments();
    const chunkCount = await getChunkCount();
    
    return NextResponse.json({
      documents: docs,
      chunkCount,
      message: docs.length > 0 
        ? `${docs.length} document(s) indexed with ${chunkCount} chunks`
        : "No documents indexed",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Clear all documents from knowledge base
 */
export async function DELETE() {
  try {
    await clearAll();
    console.log("🗑️ Knowledge base cleared via API");
    
    return NextResponse.json({
      success: true,
      message: "Knowledge base cleared successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
