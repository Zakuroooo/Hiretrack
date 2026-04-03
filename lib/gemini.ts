export async function analyzeResumeMatch(
  jobDescription: string,
  resumeText: string
): Promise<{
  score: number
  summary: string
  strengths: string[]
  gaps: string[]
  keywords: { matched: string[], missing: string[] }
  recommendation: string
  interviewReadiness: 'Low' | 'Medium' | 'High'
}> {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are an expert ATS resume analyzer. Always respond with valid JSON only, no markdown, no explanation.'
          },
          {
            role: 'user',
            content: `Analyze this resume against the job description.
Respond with ONLY this JSON structure:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence assessment>",
  "strengths": ["<s1>", "<s2>", "<s3>", "<s4>"],
  "gaps": ["<g1>", "<g2>", "<g3>"],
  "keywords": {
    "matched": ["<k1>", "<k2>", "<k3>", "<k4>"],
    "missing": ["<k1>", "<k2>", "<k3>"]
  },
  "recommendation": "<one specific actionable tip>",
  "interviewReadiness": "<Low or Medium or High>"
}

Job Description:
${jobDescription}

Resume:
${resumeText}`
          }
        ]
      })
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Groq API error')
  }

  const text = data.choices[0].message.content
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  const parsed = JSON.parse(cleaned)
  parsed.score = Math.min(100, Math.max(0, Number(parsed.score)))
  return parsed
}