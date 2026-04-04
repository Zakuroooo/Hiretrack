import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return errorResponse("No file provided", 400);
    }
    
    if (file.type !== "application/pdf") {
      return errorResponse("Only PDF files are allowed", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `hiretrack/resumes/${user._id}`, resource_type: "raw", format: "pdf" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return successResponse({ url: (result as any).secure_url });
  } catch (error) {
    console.error("Upload resume error:", error);
    return errorResponse("Internal server error", 500);
  }
}
