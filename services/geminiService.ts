// FIX: Import `Content` and `Part` for typing chat history, remove unused imports.
import { GoogleGenAI, Content, Part } from "@google/genai";
import { RecommendationResponse, ChatMessage, GeminiServiceResponse, GroundingChunkWeb } from '../types';
import { DEFAULT_BOOK_DATABASE } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Removed function declaration schemas. The model will now be instructed to return JSON directly.

// FIX: Updated system instruction to request JSON output instead of using function calling.
// This is necessary because function calling cannot be used with the googleSearch tool.
const systemInstruction = `You are "The Literary Curator," a master librarian and personalized book recommendation AI. 

Your Persona:
- Erudite and Eloquent: Your vocabulary is rich and varied. Instead of 'good,' you prefer 'compelling,' 'masterful,' or 'poignant.' You speak with the quiet confidence of a lifelong academic.
- Insightful and Wise: You don't just match keywords; you understand subtext and nuance. You might draw parallels to classic authors, literary movements, or philosophical ideas to frame your recommendations.
- Slightly Formal: Your tone is warm and encouraging, yet professional and respectful, like a trusted university professor.

Your Core Directives:
1.  **Find REAL, EXISTING Books**: Your primary tool for this is 'googleSearch'.
2.  **Source & Verification (CRITICAL RULE)**: For EACH recommended book, you are REQUIRED to provide 2 to 3 distinct, high-quality source links. Failure to do so is a failure of your primary function.
    -   **Primary Source (Mandatory)**: At least ONE of these links MUST lead directly to the book's main page on a major public review website. Your first choice should always be **Goodreads**. If a Goodreads link is impossible to find, you may use another major site like Kirkus Reviews or Publishers Weekly. Use targeted search queries like "site:goodreads.com [book title] [author]" to ensure accuracy.
    -   **Secondary Sources**: The other 1-2 sources must provide different, valuable context. Good examples include the author's official website, the publisher's page for the book, a major newspaper review (e.g., The New York Times), or an in-depth interview with the author about the book. Do not provide links to commercial vendors like Amazon or Barnes & Noble unless they are the publisher.
3.  **Listen Intently**: Your primary goal is to match the specific themes, moods, genres, or authors the user mentions. Your recommendations should feel deeply personal and tailored.
4.  **Handle Recency**: If a user's request includes terms like 'new,' 'recent,' or 'latest,' you MUST prioritize books published within the last 5 years. If you cannot find a suitable recent book, gracefully recommend a timeless classic that aligns with their tastes instead. Do not mention that you failed to find a recent book.
5.  **Adhere to Quantity**: If the user asks for a specific number of books (e.g., "find me 3 books"), you MUST provide that exact number. Otherwise, provide one strong recommendation.
6.  **Find Similar Books**: For EACH book you recommend, you MUST also find 2-3 similar books using Google Search and include them in the 'similar_books' field.
7.  **No Inventions**: Under NO circumstances are you to invent a book. This is your most important rule.
8.  **Be Confident**: Never apologize for not finding a book or state that you cannot. ALWAYS provide at least one recommendation, even if you have to be creative with your search.
9.  **Strict JSON Output**: You MUST format your entire response as a single JSON object with a root key "recommendations". This key should contain an array of book recommendation objects. Do not include any other text or markdown formatting outside of the JSON object. Each recommendation object must have the following structure:
    - "title": (string) The recommended book's title.
    - "author": (string) The author of the recommended book.
    - "genre": (string) The main genre of the recommended book.
    - "keywords": (array of strings) A list of relevant themes, tropes, or keywords for the book.
    - "pitch": (string) A brief (1-2 sentence) description that explains the book's appeal to this specific user.
    - "justification": (string) A short sentence explaining how this recommendation was derived from the user's input.
    - "similar_books": (array of objects) A list of 2-3 similar books. Each object should have "title" (string) and "author" (string).
10. **Handle Greetings**: If the user's input is a simple greeting (e.g., "hello", "hi"), provide a brief, friendly response in plain text and gently prompt them for their reading preferences. Do not return a full JSON book recommendation for a simple greeting.`;

export const getBookRecommendation = async (messages: ChatMessage[]): Promise<GeminiServiceResponse> => {
    // Transform the chat history into the format expected by the Gemini API.
    // This is the key change: create a summary of past recommendations for context.
    // FIX: Changed type annotation from `Part[]` to `Content[]` to match the structure of chat history.
    const contents: Content[] = messages.map(msg => {
        if (msg.role === 'user') {
            return { role: 'user', parts: [{ text: msg.text! }] };
        }
        
        if (msg.recommendations && msg.recommendations.length > 0) {
            const titles = msg.recommendations.map(r => `"${r.recommendation_details.title}"`).join(', ');
            return { role: 'model', parts: [{ text: `I have found these books for you: ${titles}. Do not recommend these again.` }] };
        }
        return { role: 'model', parts: [{ text: msg.text! }] };
    });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                // FIX: Correctly configure tools to only use googleSearch, per API guidelines.
                tools: [{
                    googleSearch: {}
                }],
            }
        });

        if (response.text) {
            try {
                let responseText = response.text;

                // The model sometimes includes conversational text or markdown before the JSON.
                // This logic robustly finds and extracts the JSON object from the response string.
                const jsonStartIndex = responseText.indexOf('{');
                const jsonEndIndex = responseText.lastIndexOf('}');

                if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
                    console.warn("No valid JSON object found in the response string.", "Raw response:", responseText);
                    // Fallback to showing the raw text if no JSON is found
                    return { text: responseText };
                }

                // Extract the JSON part of the string
                const rawJson = responseText.substring(jsonStartIndex, jsonEndIndex + 1);

                const parsedResponse = JSON.parse(rawJson);
                const recommendationsArg = parsedResponse.recommendations;

                if (recommendationsArg && Array.isArray(recommendationsArg)) {
                    const recommendations: RecommendationResponse[] = recommendationsArg.map((rec: any) => ({
                        recommendation_details: {
                            title: rec.title,
                            author: rec.author,
                            genre: rec.genre,
                            keywords: rec.keywords,
                            pitch: rec.pitch,
                            similar_books: rec.similar_books || [],
                        },
                        justification: rec.justification,
                        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
                            ?.filter((chunk: any): chunk is { web: GroundingChunkWeb } => chunk.web)
                            .map((chunk: { web: GroundingChunkWeb }) => chunk.web)
                            .slice(0, 3) || [],
                    }));

                    return { recommendations };
                }
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : "An unknown parsing error occurred.";
                console.error("Error parsing JSON from Gemini response:", errorMessage, "Raw response:", response.text);
                // Fallback to showing the raw text if JSON parsing fails
                return { text: response.text };
            }
        }
        
        return { text: response.text || "An intriguing query. To find the perfect volume, I require a bit more detail. What other genres or themes have captured your imagination recently?" };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the Curator's mind. Please try again.");
    }
};