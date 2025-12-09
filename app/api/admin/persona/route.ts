import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PERSONA_PATH = path.join(process.cwd(), "data", "persona.json");
const BACKUP_PATH = path.join(process.cwd(), "data", "persona.backup.json");

/**
 * GET - Get current persona data
 */
export async function GET() {
  try {
    const data = await fs.readFile(PERSONA_PATH, "utf-8");
    const persona = JSON.parse(data);
    
    return NextResponse.json({
      success: true,
      persona,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT - Update persona data (with validation and backup)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { persona } = body;
    
    if (!persona) {
      return NextResponse.json({ error: "Persona data required" }, { status: 400 });
    }
    
    // Validate required fields
    const requiredFields = ["name", "title", "contact", "skills"];
    for (const field of requiredFields) {
      if (!persona[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }
    
    // Create backup of current persona
    try {
      const currentData = await fs.readFile(PERSONA_PATH, "utf-8");
      await fs.writeFile(BACKUP_PATH, currentData, "utf-8");
      console.log("📦 Created backup of persona.json");
    } catch {
      // No existing file to backup
    }
    
    // Write new persona data
    const jsonString = JSON.stringify(persona, null, 2);
    await fs.writeFile(PERSONA_PATH, jsonString, "utf-8");
    
    console.log("✅ Persona updated successfully");
    
    return NextResponse.json({
      success: true,
      message: "Persona updated successfully",
      backupCreated: true,
    });
  } catch (error: any) {
    console.error("Persona update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Restore from backup
 */
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    
    if (action === "restore") {
      // Check if backup exists
      try {
        await fs.access(BACKUP_PATH);
      } catch {
        return NextResponse.json({ error: "No backup found" }, { status: 404 });
      }
      
      // Restore from backup
      const backupData = await fs.readFile(BACKUP_PATH, "utf-8");
      await fs.writeFile(PERSONA_PATH, backupData, "utf-8");
      
      console.log("🔄 Restored persona from backup");
      
      return NextResponse.json({
        success: true,
        message: "Persona restored from backup",
      });
    }
    
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
