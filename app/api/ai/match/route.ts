import { NextRequest } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { analyzeResumeMatch } from '@/lib/gemini';
import Application from '@/models/Application';

// ── In-memory rate limiting ──
const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

const matchSchema = z.object({
  jobDescription: z
    .string()
    .min(50, 'Job description too short (min 50 chars)'),
  resumeText: z.string().min(100, 'Resume text too short (min 100 chars)'),
  applicationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    // ── Rate limiting (10 per hour) ──
    const userId = user._id.toString();
    const now = Date.now();
    const limit = rateLimitMap.get(userId);

    if (limit && now < limit.resetTime) {
      if (limit.count >= 10) {
        return errorResponse(
          'Rate limit: max 10 analyses per hour',
          429
        );
      }
      rateLimitMap.set(userId, {
        count: limit.count + 1,
        resetTime: limit.resetTime,
      });
    } else {
      rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + 60 * 60 * 1000,
      });
    }

    // ── Validate body ──
    const body = await request.json();
    const parsed = matchSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return errorResponse(fieldErrors[0].message, 400);
    }

    const { jobDescription, resumeText, applicationId } = parsed.data;

    // ── Call Gemini ──
    let result;
    try {
      result = await analyzeResumeMatch(jobDescription, resumeText);
    } catch (err) {
      console.error('Gemini API error:', err);
      return errorResponse('AI service error', 500);
    }

    // ── Optionally save to application ──
    if (applicationId) {
      const app = await Application.findById(applicationId);
      if (app && app.userId.toString() === userId) {
        await Application.findByIdAndUpdate(applicationId, {
          aiMatchScore: result.score,
          aiMatchFeedback: result.summary,
        });
      }
    }

    return successResponse(result);
  } catch (error) {
    console.error('AI match error:', error);

    if (error instanceof SyntaxError) {
      return errorResponse('AI response parse error', 500);
    }

    return errorResponse('Internal server error', 500);
  }
}
