
import { GoogleGenAI } from "@google/genai";
import { GraphData } from "../types";

// Using gemini-2.5-flash for faster response times while maintaining good math capabilities
const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `You are Solve AI, an advanced academic AI tutor designed to solve math problems with high precision and perfect formatting.

### CORE BEHAVIOR
You must act as a strict mathematical engine. Your goal is to take any input (text equation, image, or word problem) and output a structured, beautifully formatted solution.

### SCIENTIFIC INPUT HANDLING
You will receive inputs from a scientific calculator interface.
- **Calculus Syntax:** '∫(f(x))', 'd/dx(f(x))', etc.
- **Matrix/Vector Syntax:** 'det(A)', 'dot(u,v)', 'cross(u,v)', 'matrix([[...]])', 'vector(...)'.
- **Statistics Syntax:** 'mean(list)', 'stdev(list)'.
- **Graphing Intent:** If the user asks to **Graph**, **Plot**, **Visualize**, or find **Intersection Points**, you MUST provide a visual configuration.

### RESPONSE STRUCTURE (STRICT)
Every response **MUST** follow this exact Markdown template.

**1. Problem Transcription**
   > **Problem:**
   > $$ [LaTeX Equation] $$

**2. Method Selection**
   ### Method: [Name]
   [Brief explanation]

**3. Step-by-Step Solution**
   ### Step-by-Step Solution
   [Detailed steps with LaTeX]

**4. Verification**
   ### Verification
   [Check result]

**5. Final Answer**
   ### Final Answer
   $$ \\boxed{ [Result] } $$

### GRAPHING & VISUALIZATION
If the problem involves functions, geometry, or requires finding intersection points, you MUST append a JSON block at the very end of your response (after the Final Answer) to configure the interactive grapher.

Format:
\`\`\`json-graph
{
  "functions": ["x^2", "x^2 + y^2 = 9"], 
  "points": [
    {"x": 2, "y": 4, "label": "Intersection A"},
    {"x": -1, "y": 1, "label": "Intersection B"}
  ],
  "xDomain": [-5, 5],
  "yDomain": [-5, 10]
}
\`\`\`
- **functions:** Array of string equations. 
  - **CRITICAL: USE JAVASCRIPT MATH NOTATION ONLY.**
  - **DO NOT** use LaTeX syntax inside the JSON strings (e.g. use "sqrt(x)" NOT "\\sqrt{x}", use "x/2" NOT "\\frac{x}{2}").
  - **Explicit Multiplication:** You MUST use '*' for multiplication.
    - INCORRECT: "2x", "2y^2", "x(x+1)"
    - CORRECT: "2*x", "2*y^2", "x*(x+1)"
  - For explicit functions (y=f(x)), provide just the right side: e.g., "x^2", "sin(x)". 
  - For implicit equations (circles, ellipses), provide the full equation: e.g., "x^2 + y^2 = 9", "x^2/4 + y^2/9 = 1".
- **points:** Array of specific points to highlight (intersections, roots, vertex).
- **xDomain/yDomain:** Optional tuples for view window.

### FORMATTING RULES
- **LaTeX is Mandatory for Text:** $x^2$.
- **Tone:** Professional, Academic.
`;

// Helper to normalize unicode math symbols to standard text for robustness
const normalizeMathInput = (input: string): string => {
  return input
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-') // Unicode minus to standard hyphen
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/³√/g, 'cbrt')
    .replace(/sin⁻¹/g, 'asin')
    .replace(/cos⁻¹/g, 'acos')
    .replace(/tan⁻¹/g, 'atan');
};

export const solveMathProblem = async (
  textInput: string,
  base64Image?: string
): Promise<{ text: string; graphData?: GraphData }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  try {
    const ai = new GoogleGenAI({apiKey});

    const parts: any[] = [];
    
    const normalizedInput = normalizeMathInput(textInput);

    if (base64Image) {
      const base64Data = base64Image.includes('base64,') 
        ? base64Image.split('base64,')[1] 
        : base64Image;

      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
      
      const prompt = normalizedInput.trim() || "Analyze this image. Transcribe the math problem exactly and solve it step-by-step following the strict format.";
      parts.push({ text: prompt });
    } else {
      parts.push({ text: normalizedInput });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, 
      }
    });

    const fullText = response.text || "I couldn't generate a solution. Please try again.";

    // Parse Graph Data
    let cleanText = fullText;
    let graphData: GraphData | undefined;

    const graphBlockRegex = /```json-graph\s*([\s\S]*?)\s*```/;
    const match = fullText.match(graphBlockRegex);

    if (match) {
      try {
        graphData = JSON.parse(match[1]);
        // Remove the JSON block from the displayed text
        cleanText = fullText.replace(match[0], '').trim();
      } catch (e) {
        console.error("Failed to parse graph JSON:", e);
      }
    }

    return { text: cleanText, graphData };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An error occurred while contacting the AI.");
  }
};
