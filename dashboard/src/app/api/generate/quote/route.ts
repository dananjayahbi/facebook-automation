import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { model } = await request.json();

    if (!model) {
      return NextResponse.json(
        { message: "Model is required" },
        { status: 400 }
      );
    }

    // Import GoogleGenAI
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    const prompt = `Generate a unique and inspiring motivational quote. The quote should be short, impactful, and not a famous saying. Focus on themes of perseverance, growth, and self-belief. Do not include any quotation marks or attributions. Keep it under 100 words.`;

    const result = await geminiModel.generateContentStream(prompt);

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error generating quote:", error);
    return NextResponse.json(
      { message: "An error occurred while generating quote" },
      { status: 500 }
    );
  }
}
