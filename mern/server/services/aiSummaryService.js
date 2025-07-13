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

    static async generateTruthIndex(text) {
        if (!aiEnabled){
            return Math.floor(Math.random() * 100);
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
            prompt: `Rate the following statement on a scale of 0 to 99.9 in terms of factual truthfulness (0 = completely false, 100 = completely true). Only return the number.\n\nStatement:\n"${text}"\n\nTruthfulness score:`,
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
