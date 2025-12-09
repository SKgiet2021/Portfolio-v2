/**
 * Persistent vector store using LanceDB (vectordb package)
 * Data persists across server restarts
 */

import * as lancedb from 'vectordb';
import path from 'path';

// Database path - persists to disk
const DB_PATH = path.join(process.cwd(), 'data', 'lancedb');
const TABLE_NAME = 'documents';

// Connection cache
let db: lancedb.Connection | null = null;

/**
 * Get or create LanceDB connection
 */
async function getDb(): Promise<lancedb.Connection> {
  if (db) return db;
  
  console.log(`📂 Opening LanceDB at: ${DB_PATH}`);
  db = await lancedb.connect(DB_PATH);
  return db;
}

/**
 * Get the documents table
 */
async function getTable(): Promise<lancedb.Table | null> {
  const database = await getDb();
  const tables = await database.tableNames();
  
  if (tables.includes(TABLE_NAME)) {
    return database.openTable(TABLE_NAME);
  }
  
  return null;
}

/**
 * Store document chunks with embeddings
 */
export async function upsertDocument(
  documentName: string,
  chunks: Array<{ text: string; embedding: number[]; index: number }>
): Promise<void> {
  const database = await getDb();
  
  // Prepare data - using 'vector' as the embedding column name
  const data = chunks.map((chunk, i) => ({
    id: `${documentName}-${i}`,
    text: chunk.text,
    vector: chunk.embedding,
    documentName,
    chunkIndex: chunk.index,
    createdAt: Date.now(),
  }));

  // Check if table exists
  const tables = await database.tableNames();
  
  if (tables.includes(TABLE_NAME)) {
    // Delete existing chunks for this document, then add new ones
    const table = await database.openTable(TABLE_NAME);
    
    // Try to delete old data for this document
    try {
      await table.delete(`"documentName" = '${documentName}'`);
    } catch {
      // Ignore if no data exists
    }
    
    // Add new chunks
    await table.add(data);
    console.log(`📦 Updated document "${documentName}" with ${chunks.length} chunks`);
  } else {
    // Create new table
    await database.createTable(TABLE_NAME, data);
    console.log(`📦 Created table and added ${chunks.length} chunks for "${documentName}"`);
  }
}

/**
 * Search for similar chunks using vectordb's search API
 */
export async function search(
  queryEmbedding: number[],
  topK: number = 3,
  threshold: number = 0.25
): Promise<Array<{ text: string; score: number; documentName: string }>> {
  const table = await getTable();
  
  if (!table) {
    console.warn('⚠️ No documents indexed yet');
    return [];
  }

  try {
    // vectordb package uses .search() with the vector directly
    const results = await (table as any).search(queryEmbedding).limit(topK).execute();

    // Filter by threshold and format results
    const filtered = results
      .filter((r: any) => {
        // LanceDB returns _distance (lower is better for L2), convert to similarity
        const distance = r._distance || 0;
        const similarity = 1 / (1 + distance); // Convert distance to similarity
        return similarity >= threshold;
      })
      .map((r: any) => ({
        text: r.text,
        score: 1 / (1 + (r._distance || 0)),
        documentName: r.documentName,
      }));

    console.log(`🔍 Found ${filtered.length} relevant chunks`);
    return filtered;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Get list of indexed documents
 */
export async function listDocuments(): Promise<string[]> {
  const table = await getTable();
  if (!table) return [];

  try {
    // Query all records to get document names
    const results = await (table as any).search([0]).limit(10000).execute();
    const docs = [...new Set(results.map((r: any) => r.documentName))] as string[];
    return docs;
  } catch {
    return [];
  }
}

/**
 * Check if any documents are indexed
 */
export async function hasDocuments(): Promise<boolean> {
  const table = await getTable();
  return table !== null;
}

/**
 * Get total chunk count
 */
export async function getChunkCount(): Promise<number> {
  const table = await getTable();
  if (!table) return 0;

  try {
    // Create a 384-dimensional zero vector for the search
    const zeroVector = new Array(384).fill(0);
    const results = await (table as any).search(zeroVector).limit(10000).execute();
    return results.length;
  } catch {
    return 0;
  }
}

/**
 * Clear all documents from the knowledge base
 */
export async function clearAll(): Promise<void> {
  const database = await getDb();
  const tables = await database.tableNames();
  
  if (tables.includes(TABLE_NAME)) {
    await database.dropTable(TABLE_NAME);
    console.log("🗑️ Knowledge base cleared");
  }
}

/**
 * Delete a specific document by name
 * Uses a rebuild approach since LanceDB delete doesn't persist reliably
 */
export async function deleteDocument(documentName: string): Promise<boolean> {
  const database = await getDb();
  const tables = await database.tableNames();
  
  if (!tables.includes(TABLE_NAME)) {
    console.log("No documents table exists");
    return false;
  }
  
  try {
    const table = await database.openTable(TABLE_NAME);
    
    // Get all rows
    const zeroVector = new Array(384).fill(0);
    const allRows = await (table as any).search(zeroVector).limit(100000).execute();
    
    // Filter out the document to delete
    const remainingRows = allRows.filter((row: any) => row.documentName !== documentName);
    
    if (remainingRows.length === allRows.length) {
      console.log(`Document "${documentName}" not found`);
      return false;
    }
    
    // Drop the old table
    await database.dropTable(TABLE_NAME);
    
    // If there are remaining rows, recreate the table
    if (remainingRows.length > 0) {
      // Prepare data for new table (remove _distance field from search results)
      const cleanRows = remainingRows.map((row: any) => ({
        id: row.id,
        text: row.text,
        vector: row.vector,
        documentName: row.documentName,
        chunkIndex: row.chunkIndex,
        createdAt: row.createdAt,
      }));
      
      await database.createTable(TABLE_NAME, cleanRows);
    }
    
    console.log(`🗑️ Deleted document: ${documentName} (${allRows.length - remainingRows.length} chunks removed)`);
    return true;
  } catch (error) {
    console.error(`Failed to delete document ${documentName}:`, error);
    return false;
  }
}

/**
 * Get document details (chunk count per document)
 */
export async function getDocumentDetails(): Promise<Array<{ name: string; chunks: number; createdAt: number }>> {
  const table = await getTable();
  if (!table) return [];
  
  try {
    // Create a 384-dimensional zero vector for the search (all-MiniLM-L6-v2 dimension)
    const zeroVector = new Array(384).fill(0);
    
    // Get all records by doing a broad search
    const results = await (table as any).search(zeroVector).limit(10000).execute();
    
    // Group by document name
    const docMap = new Map<string, { chunks: number; createdAt: number }>();
    
    for (const row of results) {
      const name = row.documentName;
      if (!docMap.has(name)) {
        docMap.set(name, { chunks: 0, createdAt: row.createdAt || Date.now() });
      }
      docMap.get(name)!.chunks++;
    }
    
    // Convert to array
    return Array.from(docMap.entries()).map(([name, data]) => ({
      name,
      chunks: data.chunks,
      createdAt: data.createdAt,
    }));
  } catch (error) {
    console.error("Error getting document details:", error);
    return [];
  }
}
