import { NextRequest } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Board from "@/models/Board";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/response";
import { sendWelcomeEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return errorResponse(fieldErrors[0].message, 400);
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse("Email already registered", 409);
    }

    // Create user (password is hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // Create a default board for the new user
    await Board.create({
      name: "My Job Search",
      owner: user._id,
      isDefault: true,
    });

    // Generate tokens
    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email
    );
    const refreshToken = generateRefreshToken(user._id.toString());

    // Build response with refreshToken cookie
    const response = successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
        },
        accessToken,
      },
      201
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    
    // Fire and forget welcome email
    sendWelcomeEmail(user.email, user.name);

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Internal server error", 500);
  }
}
