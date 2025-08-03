
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatRequest {
  conversationId: string;
  message: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

const SYSTEM_PROMPT = `You are FertilityCare AI, a supportive and knowledgeable fertility consultant assistant. Your role is to provide evidence-based information and guidance on fertility-related topics.

## Key Guidelines
1. **Medical Disclaimer**: Always include a clear disclaimer that you are not a substitute for professional medical advice.
2. **Procedure Guidance**: When discussing tests/treatments, provide:
   - Purpose and what to expect
   - Preparation steps
   - Potential side effects
   - Recovery expectations
3. **Emotional Support**: Acknowledge the emotional aspects of fertility journeys.
4. **Evidence-Based**: Reference current medical guidelines and studies when possible.

## Response Format
- Use clear, concise language
- Break information into digestible sections
- Use bullet points for steps/lists
- Maintain an empathetic and supportive tone
- Include clear next steps or when to consult a doctor

## Topics to Cover
- Fertility assessments and indicators
- Menstrual cycle tracking and understanding
- Fertility testing options and when to consider them
- Lifestyle factors affecting fertility
- Emotional support and partner involvement
- When to seek professional help

## Important Reminders
- Never provide medical diagnoses or treatment plans
- Always recommend consulting healthcare professionals for personal advice
- Be sensitive to different cultural perspectives on fertility
- Keep responses focused on fertility-related topics
- Provide sources when referencing specific studies or statistics

Remember: Your role is to educate and support, not diagnose or treat. Always recommend professional consultation for personal medical advice.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Type guard to validate the request body
    function isChatRequest(body: any): body is ChatRequest & { geminiApiKey?: string } {
      return (
        typeof body === 'object' &&
        body !== null &&
        typeof body.conversationId === 'string' &&
        typeof body.message === 'string' &&
        Array.isArray(body.conversationHistory)
      );
    }

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch (error) {
      throw new Error('Invalid request body');
    }

    if (!isChatRequest(requestBody)) {
      throw new Error('Invalid request format');
    }

    const { conversationId, message, conversationHistory } = requestBody;

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('VITE_GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Validate input
    if (!message || !conversationId) {
      throw new Error('Missing required fields');
    }

    // Save user message to database
    const { error: insertError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
      });

    if (insertError) {
      console.error('Error saving user message:', insertError);
      throw new Error('Failed to save message');
    }

    // Prepare messages for Gemini API
    const messages = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    // Retrieve the API key from environment

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error('AI service temporarily unavailable');
    }

    // Define the expected response type from Gemini API
    interface GeminiPart {
      text: string;
    }

    interface GeminiContent {
      parts: GeminiPart[];
    }

    interface GeminiCandidate {
      content: GeminiContent;
    }

    interface GeminiResponse {
      candidates: GeminiCandidate[];
    }

    const geminiData = await geminiResponse.json() as GeminiResponse;

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from AI service');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    // Save AI response to database
    const { error: aiInsertError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
      });

    if (aiInsertError) {
      console.error('Error saving AI message:', aiInsertError);
      throw new Error('Failed to save AI response');
    }

    // Update conversation title if this is the first message
    if (conversationHistory.length === 0) {
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      await supabaseClient
        .from('conversations')
        .update({ title })
        .eq('id', conversationId);
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: unknown) {
    console.error('Chat function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});