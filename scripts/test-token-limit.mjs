import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
let OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/OPENROUTER_API_KEY=(.+)/);
  if (match) {
    OPENROUTER_API_KEY = match[1].replace(/["']/g, '').trim();
  }
}

if (!OPENROUTER_API_KEY) {
  console.error("❌ Error: OPENROUTER_API_KEY not found in .env.local or environment");
  process.exit(1);
}

// Read Data
const portfolioPath = path.join(process.cwd(), "data", "portfolio.json");
const personaPath = path.join(process.cwd(), "data", "persona.json");

const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));
const personaData = JSON.parse(fs.readFileSync(personaPath, "utf-8"));

// Construct Full Context Prompt (Simulating route.ts)
const fullContext = `
# PORFOLIO DATA:
${JSON.stringify(portfolioData, null, 2)}

# PERSONA DATA:
${JSON.stringify(personaData, null, 2)}
`;

console.log(`📊 Data Size: ~${fullContext.length} characters`);
console.log("🚀 Sending request to OpenRouter (Llama 3.3)...");

const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3000",
  },
  body: JSON.stringify({
    model: "meta-llama/llama-3.3-70b-instruct:free",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant. Analyze the following data and tell me: 1. Did you receive it all? 2. How many projects are listed? 3. What is the candidate's name?",
      },
      { role: "user", content: fullContext },
    ],
  }),
});

if (!response.ok) {
  console.error(`❌ API Error: ${response.status} ${response.statusText}`);
  const err = await response.text();
  console.error(err);
} else {
  const data = await response.json();
  console.log("\n✅ SUCCESS! Response received.");
  console.log("---------------------------------------------------");
  console.log(data.choices[0].message.content);
  console.log("---------------------------------------------------");
  if (data.usage) {
    console.log(
      `📉 Token Usage: Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`
    );
  }
}
