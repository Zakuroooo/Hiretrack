import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeResumeMatch(
  jobDescription: string,
  resumeText: string
): Promise<{
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  keywords: { matched: string[]; missing: string[] };
  recommendation: string;
  interviewReadiness: 'Low' | 'Medium' | 'High';
}> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `
You are an expert ATS resume analyzer and career coach.
Analyze this resume against the job description and respond 
with ONLY a valid JSON object, no markdown, no explanation.

Job Description:
${jobDescription}

Resume:
${resumeText}

Respond with exactly this JSON structure:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "keywords": {
    "matched": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
    "missing": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>"]
  },
  "recommendation": "<one specific actionable tip>",
  "interviewReadiness": "<Low or Medium or High>"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Clean response - remove markdown if present
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  // Validate score is 0-100
  parsed.score = Math.min(100, Math.max(0, Number(parsed.score)));

  return parsed;
}
