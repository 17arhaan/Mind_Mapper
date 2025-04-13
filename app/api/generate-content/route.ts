import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { topic, mainConcept, prompt } = await request.json()

    // Validate required fields with more detailed error messages
    if (!topic && !mainConcept) {
      console.error("Both topic and mainConcept are missing")
      return NextResponse.json(
        { error: "Missing required fields", details: "Both topic and mainConcept are required" },
        { status: 400 }
      )
    }
    if (!topic) {
      console.error("Topic is missing")
      return NextResponse.json(
        { error: "Missing required field", details: "topic is required" },
        { status: 400 }
      )
    }
    if (!mainConcept) {
      console.error("Main concept is missing")
      return NextResponse.json(
        { error: "Missing required field", details: "mainConcept is required" },
        { status: 400 }
      )
    }

    // Prepare the request to Gemini API
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured")
      return NextResponse.json(
        { error: "Configuration error", details: "GEMINI_API_KEY is not configured in environment variables" },
        { status: 500 }
      )
    }

    // Log the request details (excluding sensitive information)
    console.log("Making request to Gemini API with:", {
      topic,
      mainConcept,
      hasPrompt: !!prompt,
      model: "gemini-1.5-flash",
      apiKeyLength: apiKey.length
    })

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text:
                prompt ||
                `Generate detailed information about "${topic}" in relation to "${mainConcept}". 
            
            Format your response as follows:
            
            MAIN TOPIC: [Short title for the main topic]
            
            DESCRIPTION: [Provide a thorough description of the main topic - 2-3 sentences with important details]
            
            SUBTOPICS:
            1. [Subtopic 1]
               - [Detail 1 with explanation]
               - [Detail 2 with explanation]
            
            2. [Subtopic 2]
               - [Detail 1 with explanation]
               - [Detail 2 with explanation]
            
            For each subtopic and detail, include enough explanation to provide context and understanding.
            Keep subtopic titles concise, but provide detailed descriptions.
            DO NOT provide the response as JSON or code.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }

    console.log("Request body length:", JSON.stringify(requestBody).length)

    // Call the Gemini API with the correct model name
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    )

    let responseData
    try {
      responseData = await response.json()
      console.log("Gemini API response status:", response.status)
      console.log("Gemini API response data:", JSON.stringify(responseData, null, 2))
    } catch (error) {
      console.error("Error parsing Gemini API response:", error)
      return NextResponse.json(
        { error: "Invalid response", details: "Failed to parse Gemini API response" },
        { status: 500 }
      )
    }

    if (!response.ok) {
      console.error("Gemini API error:", responseData)
      const errorMessage = responseData?.error?.message || 
                          responseData?.error?.details?.[0]?.errorMessage || 
                          responseData?.error?.status || 
                          "Unknown error from Gemini API"
      return NextResponse.json(
        { error: "API request failed", details: errorMessage, status: response.status },
        { status: response.status }
      )
    }

    // Extract the generated text from the response
    const generatedText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      console.error("No generated text in response:", responseData)
      return NextResponse.json(
        { error: "Invalid response format", details: "No generated text found in API response" },
        { status: 500 }
      )
    }

    return NextResponse.json({ content: generatedText })
  } catch (error) {
    console.error("Error in generate-content API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
