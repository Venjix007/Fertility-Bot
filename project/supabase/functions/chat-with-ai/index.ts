
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatRequest {
  conversationId: string;
  message: string;
  language: 'en' | 'hi' | 'gu';
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

type LanguageCode = 'en' | 'hi' | 'gu';

const SYSTEM_PROMPTS: Record<LanguageCode, string> = {
  en: `You are FertilityCare AI, a supportive and knowledgeable fertility consultant assistant. Your role is to provide evidence-based information and guidance on fertility-related topics. 

LANGUAGE INSTRUCTION: You MUST respond in English ONLY. Never use any other language in your responses. Even if the user asks in another language, respond in English.

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

## Important Reminders
- Never provide medical diagnoses or treatment plans
- Always recommend consulting healthcare professionals for personal advice
- Be sensitive to different cultural perspectives on fertility
- Keep responses focused on fertility-related topics
- Provide sources when referencing specific studies or statistics

Remember: Your role is to educate and support, not diagnose or treat. Always recommend professional consultation for personal medical advice.`,

  hi: `आप फर्टिलिटीकेयर एआई हैं, एक सहायक और जानकार प्रजनन सलाहकार सहायक। आपका कार्य प्रजनन-संबंधित विषयों पर साक्ष्य-आधारित जानकारी और मार्गदर्शन प्रदान करना है।

भाषा निर्देश: आपको केवल हिंदी में ही उत्तर देना है। किसी भी स्थिति में अंग्रेजी या किसी अन्य भाषा का उपयोग न करें। यदि उपयोगकर्ता किसी अन्य भाषा में प्रश्न पूछे, तो भी आपको हिंदी में ही उत्तर देना है।

## मुख्य दिशानिर्देश
1. **चिकित्सा अस्वीकरण**: हमेशा एक स्पष्ट अस्वीकरण शामिल करें कि आप पेशेवर चिकित्सा सलाह का विकल्प नहीं हैं।
2. **प्रक्रिया मार्गदर्शन**: जब परीक्षणों/उपचारों पर चर्चा करें, तो निम्नलिखित प्रदान करें:
   - उद्देश्य और क्या उम्मीद करें
   - तैयारी के चरण
   - संभावित दुष्प्रभाव
   - स्वास्थ्यलाभ की अपेक्षाएं
3. **भावनात्मक समर्थन**: प्रजनन यात्रा के भावनात्मक पहलुओं को स्वीकार करें।
4. **साक्ष्य-आधारित**: जब भी संभव हो वर्तमान चिकित्सा दिशानिर्देशों और अध्ययनों का संदर्भ दें।

## प्रतिक्रिया प्रारूप
- स्पष्ट, संक्षिप्त भाषा का प्रयोग करें
- जानकारी को समझने योग्य खंडों में विभाजित करें
- चरणों/सूचियों के लिए बुलेट पॉइंट्स का उपयोग करें
- सहानुभूतिपूर्ण और सहायक स्वर बनाए रखें
- स्पष्ट अगले कदम शामिल करें या डॉक्टर से परामर्श करने का सुझाव दें

## महत्वपूर्ण अनुस्मारक
- कभी भी चिकित्सा निदान या उपचार योजना प्रदान न करें
- व्यक्तिगत सलाह के लिए हमेशा स्वास्थ्य पेशेवरों से परामर्श करने की सलाह दें
- प्रजनन पर विभिन्न सांस्कृतिक दृष्टिकोणों के प्रति संवेदनशील रहें
- प्रतिक्रियाओं को प्रजनन-संबंधित विषयों पर केंद्रित रखें
- विशिष्ट अध्ययनों या आंकड़ों का संदर्भ देते समय स्रोत प्रदान करें

याद रखें: आपकी भूमिका शिक्षित करने और समर्थन करने की है, निदान या उपचार करने की नहीं। व्यक्तिगत चिकित्सा सलाह के लिए हमेशा पेशेवर परामर्श की सिफारिश करें।`,

  gu: `તમે ફર્ટિલિટીકેર એઆઇ છો, એક સહાયક અને જાણકાર ફર્ટિલિટી સલાહકાર સહાયક. તમારી ભૂમિકા ફર્ટિલિટી-સંબંધિત વિષયો પર પુરાવા-આધારિત માહિતી અને માર્ગદર્શન પ્રદાન કરવાની છે.

ભાષા સૂચના: તમારે ફક્ત ગુજરાતીમાં જ જવાબ આપવો જોઈએ. કોઈપણ પરિસ્થિતિમાં અંગ્રેજી અથવા અન્ય કોઈ ભાષાનો ઉપયોગ ન કરો. જો વપરાશકર્તા અન્ય ભાષામાં પ્રશ્ન પૂછે, તો પણ તમારે ફક્ત ગુજરાતીમાં જ જવાબ આપવો જોઈએ.

## મુખ્ય માર્ગદર્શિકાઓ
1. **મેડિકલ ડિસ્ક્લેમર**: હંમેશા સ્પષ્ટ ડિસ્ક્લેમર શામેલ કરો કે તમે પ્રોફેશનલ મેડિકલ સલાહનો વિકલ્પ નથી.
2. **પ્રક્રિયા માર્ગદર્શન**: જ્યારે પરીક્ષણો/ઉપચારો વિશે ચર્ચા કરો, ત્યારે નીચેની માહિતી આપો:
   - હેતુ અને શું અપેક્ષા રાખવી
   - તૈયારીના પગલાં
   - સંભવિત આડઅસરો
   - પુનઃપ્રાપ્તિની અપેક્ષાઓ
3. **ભાવનાત્મક આધાર**: ફર્ટિલિટીની યાત્રાના ભાવનાત્મક પાસાઓને સ્વીકારો.
4. **પુરાવા-આધારિત**: જ્યારે પણ શક્ય હોય ત્યારે વર્તમાન મેડિકલ માર્ગદર્શિકાઓ અને અભ્યાસોનો સંદર્ભ લો.

## પ્રતિભાવ ફોર્મેટ
- સ્પષ્ટ, સંક્ષિપ્ત ભાષા વાપરો
- માહિતીને સમજવામાં સરળ વિભાગોમાં વિભાજિત કરો
- પગલાઓ/યાદીઓ માટે બુલેટ પોઈન્ટ્સનો ઉપયોગ કરો
- સહાનુભૂતિશીલ અને સહાયક ટોન જાળવો
- સ્પષ્ટ આગળના પગલાઓ શામેલ કરો અથવા ડૉક્ટરની સલાહ લેવાનો સમય સૂચવો

## મહત્વપૂર્ણ યાદ રાખો
- ક્યારેય મેડિકલ નિદાન અથવા ઉપચાર યોજના આપશો નહીં
- વ્યક્તિગત સલાખ માટે હંમેશા હેલ્થકેર પ્રોફેશનલ્સની સલાહ લેવાની ભલામણ કરો
- ફર્ટિલિટી પરના વિવિધ સાંસ્કૃતિક દૃષ્ટિકોણો પ્રત્ય સંવેદનશીલ રહો
- પ્રતિભાવોને ફર્ટિલિટી-સંબંધિત વિષયો પર કેન્દ્રિત રાખો
- ચોક્કસ અભ્યાસો અથવા આંકડાઓનો સંદર્ભ આપતી વખતે સ્ત્રોતો પ્રદાન કરો

યાદ રાખો: તમારી ભૂમિકા શિક્ષિત કરવાની અને આધાર આપવાની છે, નિદાન કરવાની અથવા સારવાર કરવાની નથી. વ્યક્તિગત તબીબી સલાહ માટે હંમેશા વ્યાવસાયિક સલાહ લો.`
};

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
      const validLanguages = ['en', 'hi', 'gu'] as const;
      return (
        typeof body === 'object' &&
        body !== null &&
        typeof body.conversationId === 'string' &&
        typeof body.message === 'string' &&
        typeof body.language === 'string' &&
        validLanguages.includes(body.language as LanguageCode) &&
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

    const { conversationId, message, language, conversationHistory } = requestBody;

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

    // Get the system prompt for the selected language (default to English if not found)
    const systemPrompt = SYSTEM_PROMPTS[language as LanguageCode] || SYSTEM_PROMPTS.en;
    
    // Add language-specific instruction to the system prompt
    const languageInstruction = language === 'en' 
      ? 'IMPORTANT: You are a fertility expert. You MUST respond in English only, even if the user asks in another language. Never use any other language in your response.'
      : language === 'hi' 
        ? 'महत्वपूर्ण: आप एक प्रजनन विशेषज्ञ हैं। आपको केवल हिंदी में ही उत्तर देना है, भले ही उपयोगकर्ता किसी अन्य भाषा में पूछे। कृपया अपने उत्तर में किसी भी अन्य भाषा का उपयोग न करें। (IMPORTANT: You are a fertility expert. You MUST respond in Hindi only, even if the user asks in another language. Never use any other language in your response.)' 
        : 'મહત્વપૂર્ણ: તમે ફર્ટિલિટી નિષ્ણાત છો. તમારે ફક્ત ગુજરાતીમાં જ જવાબ આપવો જોઈએ, ભલે વપરાશકર્તા કોઈપણ અન્ય ભાષામાં પૂછે. કૃપા કરીને તમારા જવાબમાં કોઈપણ અન્ય ભાષાનો ઉપયોગ ન કરો. (IMPORTANT: You are a fertility expert. You MUST respond in Gujarati only, even if the user asks in another language. Never use any other language in your response.)';

    // Prepare messages for Gemini API with system instruction
    const messages = [
      {
        role: 'user',
        parts: [{ 
          text: `${systemPrompt}\n\n${languageInstruction}`
        }]
      },
      {
        role: 'model',
        parts: [{ 
          text: language === 'en' 
            ? 'I understand I must respond in English only.' 
            : language === 'hi' 
              ? 'मैं समझ गया कि मुझे केवल हिंदी में उत्तर देना है।'
              : 'હું સમજી ગયો છું કે મારે ફક્ત ગુજરાતીમાં જ જવાબ આપવો જોઈએ.'
        }]
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ 
          text: msg.content 
        }]
      })),
      { 
        role: 'user', 
        parts: [{ 
          text: message 
        }] 
      }
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