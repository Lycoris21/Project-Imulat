import fetch from "node-fetch";

let aiEnabled = false; // WHY WASN'T IT HERE IN THE FIRST PLACE???

class aiSummaryService {
    static apiKey = process.env.COHERE_API_KEY;

    static async listAvailableModels() {
        const response = await fetch("https://api.cohere.ai/v1/models", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${aiSummaryService.apiKey}`,
            "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch model list");

        return data; // will contain a `models` array
    }

static async generateTruthIndex(text, sources = "") {
  if (!aiEnabled) {
    // Create a consistent numeric hash from the inputs
    let hash = 0;
    const combinedInput = text + sources;
    
    for (let i = 0; i < combinedInput.length; i++) {
      const char = combinedInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }

    // Process sources if provided
    if (sources) {
      const sourceList = sources.split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (sourceList.length > 0) {
        let reliabilityScore = 0;
        let sourceWeight = 0;

        sourceList.forEach(source => {
          const type = categorizeSource(source);
          if (type === 'reliable') {
            reliabilityScore += 100; // Full points for reliable sources
            sourceWeight += 1;
          } 
          else if (type === 'unreliable') {
            reliabilityScore += 10; // Minimal points for unreliable
            sourceWeight += 1;
          }
          // Unknown sources get 50 points
          else {
            reliabilityScore += 50;
            sourceWeight += 1;
          }
        });

        // Calculate base score from sources (70% weight)
        const sourceScore = sourceWeight > 0 
          ? reliabilityScore / sourceWeight 
          : 50;

        // Calculate content score from hash (30% weight)
        const contentScore = 50 + (hash % 50); // 50-100 based on content

        // Weighted average
        return Math.round((sourceScore * 0.7) + (contentScore * 0.3));
      }
    }

    // Fallback for no sources - deterministic based on content
    return 50 + (hash % 50); // 50-100 range
  }


        const apiKey = process.env.COHERE_API_KEY;

        const response = await fetch("https://api.cohere.ai/v1/generate", {
            method: "POST",
            headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
            model: "command-r-plus-08-2024",
            prompt: `Analyze this claim and its sources. Rate its truthfulness 0-100 (0=false, 100=true). Consider source reliability.\n\nClaim: "${text}"\nSources: ${sources || "None"}\n\nScore:`,
            temperature: 0.3,
            max_tokens: 5,
            stop_sequences: ["\n"]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to generate truth index");

        const score = parseInt(data.generations?.[0]?.text?.trim());
        return isNaN(score) ? null : Math.min(Math.max(score, 0), 100); // ensure 0–100
        }


    static async generateAISummary(text) {
        if (!aiEnabled){
            return "SAMPLE AI SUMMARY";
        }

        const response = await fetch("https://api.cohere.ai/v1/summarize", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${aiSummaryService.apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "command-r-plus-08-2024",
            length: "medium",
            format: "paragraph",
            extractiveness: "low",
            temperature: 0.3,
            text
        })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to generate summary");

        return data.summary;
    }
}

export default aiSummaryService;
